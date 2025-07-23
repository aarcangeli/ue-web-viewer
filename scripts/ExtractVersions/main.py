from pathlib import Path

from extract_custom_versions import extract_custom_versions
from extract_versions import extract_versions
from utils import parse_global_args


def main():
    args = parse_global_args(
        "Check all tags of UnrealEngine repository, and populate the tables of this directory"
    )

    extract_versions(Path(args.unreal_engine_path))
    extract_custom_versions(Path(args.unreal_engine_path))


if __name__ == "__main__":
    main()
