import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Generator, List, Callable

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
    read_file,
    convert_pattern_to_regex,
    fail_if_warnings,
    TokenIterator,
    TokenType,
)

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

hardcoded_names = {}

disallowed_files = [
    "UECoreTests.cpp",
]

g_skipped_enums = []

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

interesting_versions_path = Path(__file__).parent / "InterestingVersions.txt"
NameFilter = Callable[[str], bool]

g_engine_root: Path


@dataclass
class CustomVersion:
    enum_name: str
    guid: str
    enum_values: list[SerializationVersion]


def read_interesting_versions() -> NameFilter:
    all_rules = []
    for line in read_file(interesting_versions_path).splitlines():
        line = line.strip()
        # Ignore empty lines and comments
        if not line or line.startswith("#"):
            continue

        all_rules.append(convert_pattern_to_regex(line))

    return lambda name: any(re.search(rule, name) for rule in all_rules)


def extract_custom_versions(unreal_path: Path):
    global g_engine_root
    g_engine_root = unreal_path

    if not output_dir.exists():
        output_dir.mkdir(parents=True)

    enum_name_filter = read_interesting_versions()

    # List of Unreal Engine tags (eg: ["5.3.0-release", "5.3.1-release", ...])
    unreal_tags = extract_tags(unreal_path)
    latest_version = unreal_tags[-1]

    # Starts by reading the list of files where a registration might be present
    files = grab_source_files(unreal_tags[-1])
    processed_names = set()
    custom_versions = []

    for i, relative_path in enumerate(files):
        print(f"[{i + 1}/{len(files)}] Processing {relative_path}")

        # Skip files that don't contain custom version registration
        for custom_version in scan_for_custom_versions(
            relative_path, enum_name_filter, unreal_tags
        ):
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

    # Write skipped.txt
    if g_skipped_enums:
        skipped_file = Path(__file__).parent / "skipped.txt"
        write_file(skipped_file, "\n".join(sorted(g_skipped_enums)))
        print(f"Skipped {len(g_skipped_enums)} enums, see {skipped_file}")


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
    return sorted(list(unique_files))


def format_guid(guid: str) -> str:
    match = re.match(guid_pattern, guid, re.IGNORECASE)
    assert match

    if pattern1 := match.group(1):
        return f"FGuid.fromComponents({pattern1.lower()})"

    if pattern2 := match.group(2):
        return f'FGuid.fromString("{{{pattern2}}}")'

    assert False


def find_guid(source: str, guid_prop: str) -> str or None:
    standard = r"const FGuid __name__(?:\s*=\s*FGuid)?(" + guid_pattern + r");"

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

    warning(f"Cannot find GUID for {guid_prop}")
    return "__INVALID_GUID__"


def iterate_enum_registrations(source: str) -> List[str]:
    """
    Given a source code, iterate over all custom version registrations
    eg:
    FCustomVersionRegistration GEnumName(
        FFooModifierVersion::GUID,
        FFooModifierVersion::LatestVersion,
        TEXT("MyFancyName")
    );
    returns "FAvaExtrudeModifierVersion::GUID"]
    """

    iterator = TokenIterator(source)

    # State variables
    current_namespace = None
    result: List[str] = []

    def try_read_qualified_name():
        if name := iterator.read_token(TokenType.IDENTIFIER):
            while iterator.token_text == "::":
                iterator.advance()
                next_part = iterator.expect_identifier()
                name += "::" + next_part
            return name

        return None

    def combine_name(name: str) -> str:
        if current_namespace:
            return f"{current_namespace}::{name}"
        return name

    def parse_single_item():
        nonlocal current_namespace

        # Skip "using namespace" statements
        if iterator.read_token_text("using") and iterator.read_token_text("namespace"):
            return

        if iterator.read_token_text("namespace"):
            if namespace_name := try_read_qualified_name():
                if iterator.token_text != "{":
                    error("Expected '{' after namespace declaration")

                old_namespace = current_namespace
                current_namespace = namespace_name
                parse_block()
                current_namespace = old_namespace

        elif any([itm == iterator.token_text for itm in custom_version_registration]):
            iterator.advance()

            # Read the variable name
            if name := iterator.read_token(TokenType.IDENTIFIER):
                if iterator.token_text == ";":
                    # FCustomVersionRegistration Registration;
                    # Forward declaration, skip it
                    return

                iterator.expect_token_text(
                    "(", f"Expected '(' after custom version registration {name}"
                )
                guid_prop = try_read_qualified_name()
                if not guid_prop:
                    error("Expected qualified name for GUID property")
                # We can ignore the rest of the parameters

                # Add the namespace name.
                # Ok, to be precise if we are in namespace "A" it doesn't mean that the enum is really in "A",
                # However, it seems that UE always uses this pattern
                result.append(combine_name(guid_prop))

        elif iterator.token_text == "{":
            parse_block()
            return

        else:
            # Advance unknown tokens
            iterator.advance()

    def parse_block():
        assert iterator.token_text == "{"
        iterator.advance()

        while not iterator.is_eof() and iterator.token_text != "}":
            parse_single_item()

        if iterator.token_text == "}":
            iterator.advance()

    while not iterator.is_eof():
        parse_single_item()

    return result


def scan_for_custom_versions(
    relative_path: Path,
    enum_name_filter: NameFilter,
    unreal_tags: list[str],
) -> Generator[CustomVersion, None, None]:
    latest_tag = unreal_tags[-1]
    source = get_git_file(g_engine_root, relative_path, latest_tag)

    if relative_path.name in disallowed_files:
        print(f"Skipping {relative_path} as it is in the disallowed files list")
        return

    for guid_prop in iterate_enum_registrations(source):
        # We expect that the enum name is in the guid declaration (like "EnumName::GUID")
        guid_name = guid_prop.split("::")[-1]
        if (
            "GUID" != guid_name
            and "guid" not in guid_name.lower()
            and "Key" not in guid_name
        ):
            warning(
                f"Custom version {guid_prop} in {relative_path} does not have a valid GUID property: {guid_prop}"
            )
            continue
        enum_name = guid_prop.rsplit("::", 1)[0]

        # Apply the filter
        if not enum_name_filter(enum_name):
            g_skipped_enums.append(enum_name)
            continue

        if enum_name in hardcoded_names:
            enum_name = hardcoded_names[enum_name]

        print(f"Scanning enum {enum_name}")
        guid = find_guid_in_files(source, guid_prop, latest_tag)
        enum_values = find_enum_definition(enum_name, unreal_tags)

        yield CustomVersion(
            enum_name,
            guid,
            enum_values,
        )


def has_custom_version_registration(source: str) -> bool:
    for registration in custom_version_registration:
        if registration in source:
            return True

    return False


def format_custom_version(custom_version: CustomVersion, latest_version: str) -> str:
    result = make_header("extract_custom_versions.py") + "\n"

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
    result += f'  name: "{custom_version.enum_name}",\n'
    result += f"  guid: {custom_version.guid},\n"
    result += f"  details: {custom_version.enum_name}Details,\n"
    result += "});\n"

    return result


def format_custom_versions_index(custom_versions: list[CustomVersion]) -> str:
    result = make_header("extract_custom_versions.py") + "\n"

    for version in custom_versions:
        result += (
            f"import {{ {version.enum_name}Guid }} "
            f'from "./custom-versions-enums/{version.enum_name}";\n'
        )
    result += 'import type { CustomVersionGuid } from "./CustomVersionGuid";\n'
    result += "\n"

    result += "export const allCustomVersions: ReadonlyArray<CustomVersionGuid<unknown>> = [\n"
    for version in custom_versions:
        result += f"    {version.enum_name}Guid,\n"
    result += "];\n"

    return result


if __name__ == "__main__":
    args = parse_global_args(
        "Extract all custom eversion from Unreal Engine source code"
    )

    extract_custom_versions(Path(args.unreal_engine_path))
    fail_if_warnings()
