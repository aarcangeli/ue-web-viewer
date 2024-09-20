import re
import time
from dataclasses import dataclass
from pathlib import Path

from scripts.extract_versions import (
    output_dir,
    SerializationVersion,
    print_table,
    parse_enum_with_name,
    aggregate_versions,
    format_details,
)
from scripts.utils import (
    follow_paren,
    error,
    spawn_process,
    extract_tags,
    get_git_file,
    write_file,
    read_file,
    parse_global_args,
    make_header,
)

# language=pythonregexp
regex_custom_version = (
    r"\b(?:FCustomVersionRegistration|FDevVersionRegistration)\s*([\w\d]+)\((.*)\);"
)

# language=pythonregexp
usual_pattern_declaration = (
    r'([\w\d]+)::GUID,\s*([\w\d:]+)::LatestVersion,\s*TEXT\("([^"]+)"\)'
)

field_to_filename = {
    "EVisualLoggerVersion": "Engine/Source/Runtime/Engine/Private/VisualLogger/VisualLogger.cpp",
    "FLandscapeCustomVersion": "Engine/Source/Runtime/Landscape/Private/LandscapeVersion.h",
    "FMovieSceneEvaluationCustomVersion": "Engine/Source/Runtime/MovieScene/Public/Evaluation/MovieSceneEvaluationCustomVersion.h",
}

filename_hint = {
    "FAssetRegistryVersion": "AssetData.h",
    "FSkeletalMeshCustomVersion": "SkeletalMeshLegacyCustomVersions.h",
    "FRecomputeTangentCustomVersion": "SkeletalMeshLegacyCustomVersions.h",
    "FOverlappingVerticesCustomVersion": "SkeletalMeshLegacyCustomVersions.h",
}

custom_version_registration = ["FCustomVersionRegistration", "FDevVersionRegistration"]

# Match GUID with two patterns
# language=pythonregexp
guid_pattern = (
    r"[{(](?:"
    # Ex: 0x00000000, 0x00000000, 0x00000000, 0x00000000
    r"(0x[0-9A-F]+, 0x[0-9A-F]+, 0x[0-9A-F]+, 0x[0-9A-F]+)"
    # Ex: "92738C43-2988-4D9C-9A3D-9BBE6EFF9FC0"
    r"|\"([0-9A-F]+-[0-9A-F]+-[0-9A-F]+-[0-9A-F]+-[0-9A-F]+)\""
    r")[})]"
)

g_engine_root: Path
g_unreal_tags: [str]
g_file_by_name: dict[str, list[Path]] = {}
""" Map of file name (lowercase) to list of paths """


@dataclass
class CustomVersion:
    name: str
    enum_name: str
    guid: str
    friendly_name: str
    latest_version: int
    enum_values: list[SerializationVersion]


def grab_source_files(unreal_path: Path) -> list[tuple[Path, str]]:
    print("Looking for source files...")
    start = time.time()
    result = []

    directories = [
        "Engine/Source/Runtime",
        "Engine/Source/Editor",
    ]

    for directory in directories:
        result += list(unreal_path.glob(f"{directory}/**/*.h"))
        result += list(unreal_path.glob(f"{directory}/**/*.cpp"))

    # Index all files by name
    for file in result:
        name = file.name.lower()
        if name not in g_file_by_name:
            g_file_by_name[name] = []
        g_file_by_name[name].append(file)

    # only files which may contain custom versions
    result_files = []
    for file in result:
        if file.suffix.lower() == ".cpp":
            source = read_file(file)
            if has_custom_version_registration(source):
                result_files.append((file, source))

    print(f"Found {len(result)} files in {time.time() - start:.2f}s")

    return result_files


def format_guid(guid: str) -> str:
    match = re.match(guid_pattern, guid, re.IGNORECASE)
    assert match

    if pattern1 := match.group(1):
        return f"FGuid.fromComponents({pattern1})"

    if pattern2 := match.group(2):
        return f'FGuid.fromString("{{{pattern2}}}")'

    assert False


def find_guid(source: str, guid_field: str) -> str or None:
    standard = r"const FGuid __name__::GUID(?: = FGuid)?(" + guid_pattern + r");"

    # Match GUID
    if matched := re.search(
        standard.replace("__name__", guid_field), source, re.IGNORECASE
    ):
        return format_guid(matched.group(1))

    with_namespace = r"namespace\s+__name__\s*{"
    if matched := re.search(
        with_namespace.replace("__name__", guid_field), source, re.IGNORECASE
    ):
        in_namespace = r"const static FGuid GUID(?: = FGuid)?(" + guid_pattern + r");"
        remaining = follow_paren(source[matched.end() - 1 :])

        if matched := re.search(in_namespace, remaining, re.IGNORECASE):
            return format_guid(matched.group(1))

    return None


def scan_possible_files(enum_name: str):
    def try_with_name(filename: str):
        filename = filename.lower()
        if filename in g_file_by_name:
            for p in g_file_by_name[filename]:
                yield p

    if enum_name in filename_hint:
        for file in try_with_name(filename_hint[enum_name]):
            yield file

    for file in try_with_name(enum_name + ".h"):
        yield file

    if enum_name.startswith("F"):
        for file in try_with_name(enum_name[1:] + ".h"):
            yield file

    # Use git grep
    print(f"Continue to search for {enum_name} using git grep")
    files = spawn_process(
        [
            "git",
            "-C",
            g_engine_root,
            "grep",
            "--cached",
            "--full-name",
            "--files-with-matches",
            enum_name,
        ]
    )
    for filename in files.strip().split("\n"):
        full_name = g_engine_root / filename
        if full_name.is_file():
            yield Path(full_name)


def find_enum_definition(enum_name: str) -> list[SerializationVersion] or None:
    for file in scan_possible_files(enum_name):
        source = read_file(file)
        relative_path = file.relative_to(g_engine_root)

        # Find nested struct syntax
        if parse_enum_with_name("latest", enum_name, source):
            # Aggregate the same filename on other versions
            list_versions = []

            for tag in reversed(g_unreal_tags):
                revision = get_git_file(g_engine_root, relative_path, tag)
                if not revision:
                    break

                versions_at_revision = parse_enum_with_name(tag, enum_name, revision)
                if not versions_at_revision:
                    # The enum exists in a newer version, but not in this one
                    # This is probably legit
                    break

                aggregate_versions(versions_at_revision, list_versions)

            return list_versions

    error(f"Enum {enum_name} not found")


def find_guid_in_files(source: str, guid_field: str) -> str:
    # Match GUID
    if matched := find_guid(source, guid_field):
        return matched

    # Exceptional cases
    if guid_field in field_to_filename:
        new_path = g_engine_root / field_to_filename[guid_field]
        if matched := find_guid(read_file(new_path), guid_field):
            return matched

    error(f"Cannot find GUID for {guid_field}", False)


def scan_for_custom_versions(source: str) -> list[CustomVersion]:
    # Match all custom version registrations
    matches = re.findall(regex_custom_version, source)

    for match in matches:
        name, content = match

        # Match standard version declaration
        if matched := re.search(usual_pattern_declaration, content):
            guid_field, enum_name, friendly_name = matched.groups()
            print(f"Scanning enum {enum_name}")

            enum_values = find_enum_definition(enum_name)

            yield CustomVersion(
                name,
                enum_name,
                find_guid_in_files(source, guid_field),
                friendly_name,
                -1,
                enum_values,
            )


def has_custom_version_registration(source: str) -> bool:
    for registration in custom_version_registration:
        if registration in source:
            return True

    return False


def format_custom_version(version: CustomVersion) -> str:
    result = make_header() + "\n"

    result += 'import { VersionDetails } from "../registry";\n\n'

    result += print_table(version.enum_name, version.enum_values)

    # Add details
    latest_version = g_unreal_tags[-1]
    result = format_details(
        result, version.enum_name + "Details", version.enum_values, latest_version
    )

    return result


def format_custom_versions_index(custom_versions: list[CustomVersion]) -> str:
    result = make_header() + "\n"

    result += 'import { FGuid } from "../structs/Guid";\n'
    result += 'import { CustomVersionGuid } from "./registry";\n'
    for version in custom_versions:
        result += (
            f"import * as {version.enum_name} "
            f'from "./custom-versions-enums/{version.enum_name}";\n'
        )
    result += "\n"

    for version in custom_versions:
        result += f"export const {version.name} = new CustomVersionGuid<{version.enum_name}.{version.enum_name}>({{\n"
        result += f'    friendlyName: "{version.friendly_name}",\n'
        result += f"    guid: {version.guid},\n"
        result += f"    details: {version.enum_name}.{version.enum_name}Details,\n"
        result += "});\n\n"

    return result


def main():
    global g_engine_root
    global g_unreal_tags

    args = parse_global_args(
        "Extract all custom eversion from Unreal Engine source code"
    )

    if not output_dir.exists():
        output_dir.mkdir(parents=True)

    g_engine_root = unreal_path = Path(args.unreal_engine_path)
    g_unreal_tags = extract_tags(unreal_path)

    files = grab_source_files(unreal_path)
    processed_names = set()
    custom_versions = []

    for i, (source_file, source) in enumerate(files):
        print(f"[{i + 1}/{len(files)}] Processing {source_file}")

        # Skip files that don't contain custom version registration
        for custom_version in scan_for_custom_versions(source):
            if custom_version.name in processed_names:
                error(f"Duplicate custom version {custom_version.name}", False)
            processed_names.add(custom_version.name)

            output_file = (
                output_dir / f"custom-versions-enums/{custom_version.enum_name}.ts"
            )
            write_file(output_file, format_custom_version(custom_version))

            custom_versions.append(custom_version)

    write_file(
        output_dir / "ue-custom-versions.ts",
        format_custom_versions_index(custom_versions),
    )


if __name__ == "__main__":
    main()
