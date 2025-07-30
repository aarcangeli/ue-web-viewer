import re
from dataclasses import dataclass
from pathlib import Path

from utils import (
    parse_block,
    error,
    extract_tags,
    clean_tag_name,
    get_git_file,
    compare_versions,
    write_file,
    parse_global_args,
    make_header,
    warning,
    get_full_name_from_filename,
    fail_if_warnings,
)

output_dir = Path(__file__).parent.parent.parent / "src/unreal-engine/versioning"
""" Path where the output file will be saved """

path_versions = output_dir / "ue-versions.ts"
path_version_details = output_dir / "ue-version-details.ts"

regex_enum_row = r"(?://\s*(.*))?\n\s+([\d\w]+)(?: *= *(\d+))?,"

path_version_file = "Engine/Source/Runtime/Core/Public/UObject/ObjectVersion.h"

# versions to ignore
ignored_versions = {
    "VER_UE4_OLDEST_LOADABLE_PACKAGE",
    "VER_UE4_MOVEMENTCOMPONENT_UPDATEDSCENECOMPONENT",
}


@dataclass
class SerializationVersion:
    name: str
    value: int
    comment: str = None
    first_appearance: str = None
    last_appearance: str = None

    def __post_init__(self):
        # Remove unwanted characters from the comment
        self.comment = re.sub(r'[\u00A0\u2000-\u200B]+', ' ', self.comment).strip()
        # Replace double spaces with single space
        self.comment = re.sub(r'\s+', ' ', self.comment)

    def update_version(self, version):
        if compare_versions(version, self.first_appearance) < 0:
            self.first_appearance = version
        if compare_versions(version, self.last_appearance) > 0:
            self.last_appearance = version


def parse_enum_with_name(
    engine_root: Path | None,
    tag: str,
    enum_name: str,
    source: str,
) -> list[SerializationVersion] or None:
    maybe_api = r"(?:\w+_API\s*)?"
    maybe_class = r"(?:\s*class\b\s*)?"
    maybe_numeric_type = r"(?::\s*\w+)?"

    if struct_block := parse_block(
        source, rf"(struct|namespace)\s+{maybe_api}{enum_name}"
    ):
        if enum_block := parse_block(
            struct_block, rf"enum\s+{maybe_class}[\w\d]+\s*{maybe_numeric_type}"
        ):
            return parse_enum_content(engine_root, tag, enum_block)

    if enum_block := parse_block(
        source, rf"enum\s+{maybe_class}{maybe_api}{enum_name}(?:\s*:\s*[\w\d]+)?"
    ):
        return parse_enum_content(engine_root, tag, enum_block)

    return None


def parse_enum_content(
    engine_root: Path | None, tag: str, enum_content: str
) -> list[SerializationVersion]:
    if engine_root and "#include" in enum_content:
        return parse_enums_from_inline_file(engine_root, tag, enum_content)

    rows = re.findall(regex_enum_row, enum_content)
    value = None

    result = []
    already_found = set()
    for row in rows:
        comment, field_name, field_value = row

        # Ignore last fields
        if (
            "AUTOMATIC_VERSION" in field_name
            or "VersionPlusOne" in field_name
            or "LatestVersion" in field_name
        ):
            continue

        # Find version constant
        if field_value:
            value = int(field_value)
        else:
            if value is None:
                value = 0
            else:
                value = value + 1

        # Skip oldest loadable version
        if field_name in ignored_versions:
            continue

        # Check unique field names
        if field_name in already_found:
            error(f"Field {field_name} already found")
        already_found.add(field_name)

        result.append(SerializationVersion(field_name, value, comment, tag, tag))
        result.append(
            SerializationVersion(
                name=field_name,
                value=value,
                comment=comment,
                first_appearance=tag,
                last_appearance=tag,
            )
        )

    return result


def parse_enums_from_inline_file(
    engine_root: Path, tag: str, enum_content: str
) -> list[SerializationVersion]:
    """
    UE I hate you so much.
    FFortniteMainBranchObjectVersion contains the enum definition inline in the file "FortniteMainBranchObjectVersions.inl"
    So we need to parse that file instead of the main header file.
    """

    match = re.search(r"^\s*#\s*include\b\s*\"([^$\"]+)\"", enum_content, re.MULTILINE)
    if not match:
        error(f"Could not find include for tag {tag}")

    inline_file = match.group(1).strip()
    found_files = get_full_name_from_filename(engine_root, Path(inline_file).name, tag)
    if len(found_files) != 1:
        error(
            f"Expected exactly one file for {inline_file} in tag {tag}, found {len(found_files)}"
        )

    source_file = get_git_file(engine_root, found_files[0], tag)

    # Find macro name
    # #define UE5_MAIN_VERSION(Version, ID) Version,
    match = re.search(
        r"^\s*#\s*define\s+(\w+)\s*\(Version, ID\) Version,\n",
        source_file,
        re.MULTILINE,
    )
    if not match:
        error(f"Could not find macro definition in {inline_file} for tag {tag}")
    macro_name = match.group(1).strip()

    # FORTNITE_MAIN_VERSION(BeforeCustomVersionWasAdded, 0)
    all_results = re.findall(
        rf"(?://\s*(.*)\n)?{macro_name}\s*\(([^,]+),\s*([0-9]+)\s*\)", source_file
    )
    result = []
    for comment, name, value in all_results:
        result.append(
            SerializationVersion(
                name=name.strip(),
                value=int(value),
                comment=comment,
                first_appearance=tag,
                last_appearance=tag,
            )
        )

    if not result:
        error(f"No versions found in {inline_file} for tag {tag}")

    return result


def parse_version_enums(
    tag: str, enum_name: str, file: str
) -> list[SerializationVersion]:
    # find regex
    enum_content = parse_enum_with_name(None, tag, enum_name, file)
    if not enum_content:
        error(f"Enum {enum_name} not found")

    return enum_content


def format_versions(
    ue4_versions: list[SerializationVersion],
    ue5_versions: list[SerializationVersion],
):
    result = make_header("extract_versions.py")
    result += "// This file contains all the versions used by Unreal Engine to serialize objects\n"
    result += "// The global version number is placed in the summary of all assets\n"
    result += "// See ObjectVersion.h for more information\n\n"

    result += print_table("EUnrealEngineObjectUE4Version", ue4_versions)
    result += print_table("EUnrealEngineObjectUE5Version", ue5_versions)

    return result.strip() + "\n"


def escape_string(s):
    return '"' + str(s).replace('"', '\\"') + '"'


def format_details(result, field_name, versions, latest_version):
    result += f"export const {field_name}: VersionDetails[] = [\n"
    for version in versions:
        result += "  new VersionDetails({\n"
        result += f"    name: {escape_string(version.name)},\n"
        if version.comment:
            result += f"    comment: {escape_string(version.comment)},\n"
        result += f"    value: {version.value},\n"
        result += f"    firstAppearance: {escape_string(clean_tag_name(version.first_appearance))},\n"
        if version.last_appearance != latest_version:
            result += f"    lastAppearance: {escape_string(clean_tag_name(version.last_appearance))},\n"
        result += "  }),\n"
    result += "];\n"

    return result


def format_version_details(
    ue4_versions: list[SerializationVersion],
    ue5_versions: list[SerializationVersion],
    latest_version,
):
    result = f"{make_header('extract_versions.py')}\n"
    result += 'import { VersionDetails } from "./CustomVersionGuid";\n\n'

    # Print merged version details
    result = format_details(
        result, "versionsDetails", ue4_versions + ue5_versions, latest_version
    )

    return result


def print_table(name, versions: list[SerializationVersion]):
    result = f"export enum {name} {{\n"

    last_ue_version = None

    for version in versions:
        if last_ue_version != version.first_appearance:
            if last_ue_version:
                result += "  // endregion\n\n"
            result += f"  // region Introduced with UE {clean_tag_name(version.first_appearance)}\n"
            last_ue_version = version.first_appearance

        if version.comment:
            result += f"  /// {version.comment.strip()}\n"
        result += f"  {version.name} = {version.value},\n"
    if last_ue_version:
        result += "  // endregion\n"
    result += "}\n\n"

    return result


def validate_table(version_by_name_ue4: list[SerializationVersion]):
    seen_versions = set()

    for version in version_by_name_ue4:
        if version.value in seen_versions:
            warning(f"WARNING: Version number {version.value} is duplicated")
        seen_versions.add(version.value)


def aggregate_versions(
    versions: list[SerializationVersion], result_list: list[SerializationVersion]
):
    for v in versions:
        # Find a constant with the same value but different name
        if any(it.value == v.value and it.name != v.name for it in result_list):
            print(
                f"Version {v.name} with value {v.value} already exists, skipping"
            )
            continue

        # Get the index of the version already stored in the list, if any
        found_index = next(
            (i for i, it in enumerate(result_list) if it.name == v.name),
            None,
        )

        if found_index is not None:
            found_element = result_list[found_index]

            # Apparently, there is a case in FCustomizableObjectCustomVersion where the value of a version changes between tags.
            # Since we scan tags from the latest to the oldest, we can just ignore the value change and only use the latest version.
            if found_element.value != v.value:
                warning(
                    f"Field {v.name} has different version number {v.value} != {found_element.value}"
                )

            # Latest version should have a better comment
            if v.comment and v.comment != found_element.comment:
                if (
                    compare_versions(v.first_appearance, found_element.last_appearance)
                    >= 0
                ):
                    found_element.comment = v.comment

            found_element.update_version(v.first_appearance)
            found_element.update_version(v.last_appearance)

        else:
            result_list.append(
                SerializationVersion(
                    name=v.name,
                    value=v.value,
                    comment=v.comment,
                    first_appearance=v.first_appearance,
                    last_appearance=v.last_appearance,
                )
            )


def extract_versions(unreal_path: Path):
    if not output_dir.exists():
        output_dir.mkdir(parents=True)

    if not unreal_path.exists():
        print(f"Path {unreal_path} does not exist")

    version_by_name_ue4: list[SerializationVersion] = []
    version_by_name_ue5: list[SerializationVersion] = []

    tags = extract_tags(unreal_path) or error(f"Could not find tags in {unreal_path}")
    latest_version = tags[-1]

    for tag in reversed(tags):
        # for tag in tags:
        print(f"Processing tag {tag}")

        file = get_git_file(unreal_path, path_version_file, tag)

        # Extract UE4 versions
        ue4_versions = parse_version_enums(tag, "EUnrealEngineObjectUE4Version", file)
        aggregate_versions(ue4_versions, version_by_name_ue4)

        # ue5 is optional
        if tag.startswith("5."):
            ue5_versions = parse_version_enums(
                tag, "EUnrealEngineObjectUE5Version", file
            )
            aggregate_versions(ue5_versions, version_by_name_ue5)

    print("Validating tables")
    validate_table(version_by_name_ue4)
    validate_table(version_by_name_ue5)

    # sort
    print("Sorting versions")
    version_by_name_ue4.sort(key=lambda v: v.value)
    version_by_name_ue5.sort(key=lambda v: v.value)

    versions = format_versions(version_by_name_ue4, version_by_name_ue5)
    version_details = format_version_details(
        version_by_name_ue4, version_by_name_ue5, latest_version
    )

    write_file(path_versions, versions)
    write_file(path_version_details, version_details)


if __name__ == "__main__":
    args = parse_global_args(
        "Check all tags of UnrealEngine repository, and populate the tables of this directory"
    )

    extract_versions(Path(args.unreal_engine_path))
    fail_if_warnings()
