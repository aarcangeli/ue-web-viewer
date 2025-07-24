import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Generator, List

from extract_versions import (
    output_dir,
    SerializationVersion,
    print_table,
    parse_enum_with_name,
    aggregate_versions,
    format_details,
)
from utils import (
    follow_paren,
    error,
    extract_tags,
    get_git_file,
    write_file,
    parse_global_args,
    make_header,
    warning,
    grep_files,
    get_full_name_from_filename,
)

# Debug purpose: If specified, filter the files and symbols to process.
#   - debug_filter_path: filename (like SnapshotCustomVersion.cpp)
#   - debug_specific_enum: the enum name (like "EVisualLoggerVersion")
debug_filter_path = ""
debug_specific_enum = ""

# language=pythonregexp
regex_custom_version = (
    r"\b(?:FCustomVersionRegistration|FDevVersionRegistration)\s*(\w+)\((.*)\);"
)

# language=pythonregexp
usual_pattern_declaration = r"^\s*([\w:]+),\s*(?:static_cast<int32>\()?\s*([\w:]+)::(?:LatestVersion|FirstVersion)\)?,\s*TEXT\(\s*\"([^\"]+)\"\s*\)"

field_to_filename = {
    "EVisualLoggerVersion::GUID": "Engine/Source/Runtime/Engine/Private/VisualLogger/VisualLogger.cpp",
    "FLandscapeCustomVersion::GUID": "Engine/Source/Runtime/Landscape/Private/LandscapeVersion.h",
    "FMovieSceneEvaluationCustomVersion::GUID": "Engine/Source/Runtime/MovieScene/Public/Evaluation/MovieSceneEvaluationCustomVersion.h",
}

filename_hint = {
    "FAssetRegistryVersion": "AssetData.h",
    "FSkeletalMeshCustomVersion": "SkeletalMeshLegacyCustomVersions.h",
    "FRecomputeTangentCustomVersion": "SkeletalMeshLegacyCustomVersions.h",
    "FOverlappingVerticesCustomVersion": "SkeletalMeshLegacyCustomVersions.h",
}

hardcoded_names = {
    "FDynamicMaterialModelEditorOnlyDataVersion::Type": "FDynamicMaterialModelEditorOnlyDataVersion",
}

custom_version_registration = ["FCustomVersionRegistration", "FDevVersionRegistration"]

# This is a list of known duplicates that should be renamed
known_duplicates = []

# Match GUID with two patterns
# language=pythonregexp
guid_pattern = (
    r"[{(]\s*(?:"
    # Ex: 0x00000000, 0x00000000, 0x00000000, 0x00000000
    r"(0x[0-9A-F]+, 0x[0-9A-F]+, 0x[0-9A-F]+, 0x[0-9A-F]+)"
    # Ex: "92738C43-2988-4D9C-9A3D-9BBE6EFF9FC0"
    r"|\"([0-9A-F]+-[0-9A-F]+-[0-9A-F]+-[0-9A-F]+-[0-9A-F]+)\""
    r")\s*[})]"
)

g_engine_root: Path


@dataclass
class CustomVersion:
    enum_name: str
    guid: str
    friendly_name: str
    enum_values: list[SerializationVersion]


def extract_custom_versions(unreal_path: Path):
    global g_engine_root

    if not output_dir.exists():
        output_dir.mkdir(parents=True)

    g_engine_root = unreal_path

    # List of Unreal Engine tags (eg: ["5.3.0-release", "5.3.1-release", ...])
    unreal_tags = extract_tags(unreal_path)
    latest_version = unreal_tags[-1]

    files = grab_source_files(unreal_tags[-1])
    processed_names = set()
    custom_versions = []

    # If filter_path is set, only process that file
    if debug_filter_path:
        files = [file for file in files if debug_filter_path in str(file)]

    for i, relative_path in enumerate(files):
        print(f"[{i + 1}/{len(files)}] Processing {relative_path}")

        # Skip files that don't contain custom version registration
        for custom_version in scan_for_custom_versions(relative_path, unreal_tags):
            enum_name = custom_version.enum_name

            if enum_name in known_duplicates:
                # Rename the enum to avoid duplicates
                enum_name = f"{enum_name}_v{len(custom_versions)}"
                warning(
                    f"Renaming duplicate custom version {custom_version.enum_name} to {enum_name}"
                )
                custom_version.enum_name = enum_name

            # Check for duplicates
            if enum_name in processed_names:
                error(f"Duplicate custom version {enum_name}")
            processed_names.add(enum_name)

            custom_versions.append(custom_version)

            # Write the version file
            output_file = (
                output_dir / f"custom-versions-enums/{custom_version.enum_name}.ts"
            )
            write_file(
                output_file, format_custom_version(custom_version, latest_version)
            )

    write_file(
        output_dir / "ue-custom-versions.ts",
        format_custom_versions_index(custom_versions),
    )


def grab_source_files(latest_tag: str) -> List[Path]:
    print("Looking for source files...")
    start = time.time()

    # Get all files which contains at least one custom version registration
    unique_files = set()
    for pattern in custom_version_registration:
        files = grep_files(g_engine_root, pattern, latest_tag)
        for file in files:
            if file.suffix.lower() == ".cpp":
                unique_files.add(file)

    print(f"Found {len(unique_files)} files in {time.time() - start:.2f}s")
    return list(unique_files)


def format_guid(guid: str) -> str:
    match = re.match(guid_pattern, guid, re.IGNORECASE)
    assert match

    if pattern1 := match.group(1):
        return f"FGuid.fromComponents({pattern1})"

    if pattern2 := match.group(2):
        return f'FGuid.fromString("{{{pattern2}}}")'

    assert False


def find_guid(source: str, guid_prop: str) -> str or None:
    standard = r"const FGuid __name__(?: = FGuid)?(" + guid_pattern + r");"

    # Match GUID
    if matched := re.search(
        standard.replace("__name__", guid_prop), source, re.IGNORECASE
    ):
        return format_guid(matched.group(1))

    if guid_prop.lower().endswith("::guid"):
        without_suffix = guid_prop.rsplit("::", 1)[0]
        with_namespace = rf"(?:namespace|struct)\s+{without_suffix}\s*{{"
        if matched := re.search(with_namespace, source, re.IGNORECASE):
            in_namespace = r"\bFGuid GUID(?: = FGuid)?(" + guid_pattern + r");"
            remaining = follow_paren(source[matched.end() - 1 :])

            if matched := re.search(in_namespace, remaining, re.IGNORECASE):
                return format_guid(matched.group(1))

    return None


def scan_possible_files(enum_name: str, latest_tag: str):
    """
    Returns a generator of possible files that may contain the enum definition.
    :param enum_name:
    :param latest_tag:
    :return:
    """

    # 1. Try from the list of hardcoded filenames
    if enum_name in filename_hint:
        yield from get_full_name_from_filename(
            g_engine_root, filename_hint[enum_name], latest_tag
        )

    # 2. Try with the enum name
    yield from get_full_name_from_filename(g_engine_root, enum_name + ".h", latest_tag)

    # 3. Try with the enum name without F prefix
    if enum_name.startswith("F"):
        file_name = enum_name[1:] + ".h"
        yield from get_full_name_from_filename(g_engine_root, file_name, latest_tag)

    # Last resort: find all files with the enum name in the content
    print(f"Continue to search for {enum_name} using git grep")
    for filename in grep_files(g_engine_root, enum_name, latest_tag):
        yield filename


def find_enum_definition(
    enum_name: str,
    unreal_tags: list[str],
) -> list[SerializationVersion]:
    latest_tag = unreal_tags[-1]

    for relative_path in scan_possible_files(enum_name, latest_tag):
        source = get_git_file(g_engine_root, relative_path, latest_tag)

        # Find nested struct syntax
        if parse_enum_with_name(g_engine_root, latest_tag, enum_name, source):
            # Aggregate the same filename on other versions
            list_versions = []

            for tag in reversed(unreal_tags):
                revision = get_git_file(g_engine_root, relative_path, tag)
                if not revision:
                    break

                versions_at_revision = parse_enum_with_name(
                    g_engine_root, tag, enum_name, revision
                )
                if not versions_at_revision:
                    # The enum exists in a newer version, but not in this one
                    # This is probably legit
                    break

                aggregate_versions(versions_at_revision, list_versions)

            return list_versions

    error(f"Enum definition of {enum_name} not found")


def find_guid_in_files(source: str, guid_prop: str, latest_tag: str) -> str:
    # Match GUID
    if matched := find_guid(source, guid_prop):
        return matched

    # Exceptional cases
    if guid_prop in field_to_filename:
        source_file = get_git_file(
            g_engine_root, field_to_filename[guid_prop], latest_tag
        )
        if matched := find_guid(source_file, guid_prop):
            return matched

    error(f"Cannot find GUID for {guid_prop}")


def scan_for_custom_versions(
    relative_path: Path,
    unreal_tags: list[str],
) -> Generator[CustomVersion, None, None]:
    latest_tag = unreal_tags[-1]
    source = get_git_file(g_engine_root, relative_path, latest_tag)

    # Match all custom version registrations
    matches = re.findall(regex_custom_version, source)

    # Finds over all fields
    # FCustomVersionRegistration field_name(guid_prop::GUID, enum_name::LatestVersion, TEXT("friendly_name"));
    for field_name, content in matches:
        # Match standard version declaration
        matched = re.search(usual_pattern_declaration, content)
        if not matched:
            warning(f"Cannot parse custom version {field_name} in {relative_path}")
            continue
        guid_prop, enum_name, friendly_name = matched.groups()

        if debug_specific_enum and enum_name != debug_specific_enum:
            continue

        # Starting from 5.6, some enums are declared in namespaces (eg: UE::LevelSnapshots::FSnapshotCustomVersion)
        if enum_name in hardcoded_names:
            enum_name = hardcoded_names[enum_name]
        if "::" in enum_name:
            enum_name = enum_name.split("::")[-1]

        print(f"Scanning enum {enum_name}")

        guid = find_guid_in_files(source, guid_prop, latest_tag)
        enum_values = find_enum_definition(enum_name, unreal_tags)

        yield CustomVersion(
            enum_name,
            guid,
            friendly_name,
            enum_values,
        )


def has_custom_version_registration(source: str) -> bool:
    for registration in custom_version_registration:
        if registration in source:
            return True

    return False


def format_custom_version(custom_version: CustomVersion, latest_version: str) -> str:
    result = make_header() + "\n"

    result += (
        'import { VersionDetails, CustomVersionGuid } from "../CustomVersionGuid";\n'
    )
    result += 'import { FGuid } from "../../modules/CoreUObject/structs/Guid";\n\n'

    result += print_table(custom_version.enum_name, custom_version.enum_values)

    # Add details
    result = format_details(
        result,
        custom_version.enum_name + "Details",
        custom_version.enum_values,
        latest_version,
    )
    result += "\n"

    # Add the guid
    result += f"export const {custom_version.enum_name}Guid = new CustomVersionGuid<{custom_version.enum_name}>({{\n"
    result += f'  friendlyName: "{custom_version.friendly_name}",\n'
    result += f"  guid: {custom_version.guid},\n"
    result += f"  details: {custom_version.enum_name}Details,\n"
    result += "});\n\n"

    return result


def format_custom_versions_index(custom_versions: list[CustomVersion]) -> str:
    result = make_header() + "\n"

    for version in custom_versions:
        result += (
            f"import {{ {version.enum_name}Guid }} "
            f'from "./custom-versions-enums/{version.enum_name}";\n'
        )
    result += "\n"

    result += "export const allCustomVersions = [\n"
    for version in custom_versions:
        result += f"    {version.enum_name}Guid,\n"
    result += "];\n"

    return result


if __name__ == "__main__":
    args = parse_global_args(
        "Extract all custom eversion from Unreal Engine source code"
    )

    extract_custom_versions(Path(args.unreal_engine_path))
