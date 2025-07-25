import argparse
import io
import re
import subprocess
import sys
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import NoReturn, List, Generator, Tuple

g_warning_counter = 0


def error(message: str) -> NoReturn:
    print(f"ERROR: {message}", file=sys.stderr)
    sys.exit(1)


def warning(message: str):
    global g_warning_counter
    print(f"WARNING: {message}", file=sys.stderr)
    g_warning_counter += 1


def fail_if_warnings():
    if g_warning_counter > 0:
        error(f"{g_warning_counter} warnings were encountered during processing.")


def parse_block(source: str, prefix: str):
    """
    Given a block of text, finds a block using the provided regex, and scans until the matching '}' is found.

    es: parse_block("struct FStruct { int32 Value; }", "struct FStruct") -> "{ int32 Value; }"
    """
    if match := re.search(prefix + r"\s*{", source, re.IGNORECASE):
        start = match.end()
        return follow_paren(source[start - 1 :])
    return None


def split_arguments(source: str) -> List[str]:
    """
    Given a text of the form "a, b, c(1,2)", split it into a list of arguments

    es: "a, b, c(1,2), d{1,2}, TEXT("text")" -> ["a", "b", "c(1,2)", "d{1,2}", "TEXT(\"text\")"]
    """

    arguments = []
    current_arg = ""
    level = 0
    in_string = False
    escaped = False

    for c in source:
        if escaped:
            current_arg += c
            escaped = False
            continue

        if c == "," and level == 0 and not in_string:
            arguments.append(current_arg.strip())
            current_arg = ""
        elif c == "\\" and in_string:
            # Handle escaped characters in strings
            current_arg += c
            escaped = not escaped
        else:
            if c in "{[(":
                level += 1
            elif c in "}])":
                level -= 1
            elif c == '"':
                in_string = not in_string
            current_arg += c

    if current_arg:
        arguments.append(current_arg.strip())

    return arguments


def follow_paren(source: str) -> str:
    """Given a source string with a starting '{', return the string until the matching '}'"""

    assert source.startswith("{")

    level = 0
    for i, c in enumerate(source):
        if c == "{":
            level += 1
        elif c == "}":
            level -= 1
            if level == 0:
                return source[: i + 1]

    return source


def spawn_process(command: list[str], allow_error=False, print_errors=True):
    command = [str(x) for x in command]

    print(f"-- Running {' '.join(command)}")
    process = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=None if print_errors else subprocess.PIPE,
        shell=True,
    )

    if process.returncode != 0 and not allow_error:
        error(f"process returned {process.returncode}")

    return process.stdout.decode("utf-8")


def compare_versions(a: str, b: str) -> int:
    left = [int(i) for i in a.split("-")[0].split(".")]
    right = [int(i) for i in b.split("-")[0].split(".")]
    if left < right:
        return -1
    if left > right:
        return 1
    return 0


class TokenType(Enum):
    IDENTIFIER = "IDENTIFIER"
    OPERATOR = "OPERATOR"
    STRING_LITERAL = "STRING_LITERAL"
    NUMERIC_LITERAL = "NUMERIC_LITERAL"
    COMMENT = "COMMENT"
    EOF = "EOF"
    UNKNOWN = "UNKNOWN"

    def __str__(self):
        return self.value


def tokenize_cpp(source: str) -> Generator[Tuple[TokenType, str], None, None]:
    """
    Tokenizes a C++ source code string into a generator of tokens.
    Returns identifiers, keywords, operators (but not digraphs), literals and comments.
    Whitespaces are removed.
    """

    i = 0
    length = len(source)

    while i < length:
        token_start = i
        c = source[i]

        # Handle spaces
        if c.isspace():
            i += 1
            while i < length and source[i].isspace():
                i += 1
            # Skip whitespaces
            continue

        # Handle single line comments
        elif c == "/" and i + 1 < length and source[i + 1] == "/":
            i += 2
            while i < length and source[i] != "\n":
                i += 1
            yield TokenType.COMMENT, source[token_start:i].strip()

        elif c == "/" and i + 1 < length and source[i + 1] == "*":
            # Multi-line comment
            i += 2
            while i < length - 1 and not (source[i] == "*" and source[i + 1] == "/"):
                i += 1
            i += 2
            yield TokenType.COMMENT, source[token_start:i].strip()

        # Handle string and character literals
        elif c == '"' or c == "'":
            quote = c
            i += 1
            while i < length:
                if source[i] == quote:
                    i += 1
                    break
                elif source[i] == "\\" and i + 1 < length:
                    # Skip escaped characters
                    i += 2
                else:
                    i += 1
            yield TokenType.STRING_LITERAL, source[token_start:i].strip()

        # Handle numeric literals
        elif c.isdigit() or (c == "." and i + 1 < length and source[i + 1].isdigit()):
            # Handle all pp-number
            i += 1
            while i < length:
                if source[i].isdigit() or source[i] == ".":
                    i += 1
                elif source[i] == "'" and i + 1 < length and (source[i + 1].isalnum()):
                    i += 2
                elif source[i] in "EePp" and i + 1 < length and (source[i + 1] in "-+"):
                    i += 2
                else:
                    break
            yield TokenType.NUMERIC_LITERAL, source[token_start:i].strip()

        # Handle identifiers
        elif c.isalpha() or c == "_":
            i += 1
            while i < length and (source[i].isalnum() or source[i] == "_"):
                i += 1
            identifier = source[token_start:i].strip()
            yield TokenType.IDENTIFIER, identifier

        # Handle operators
        elif c == ".":
            if i + 2 < length and source[i + 1] == "." and source[i + 2] == ".":
                i += 3
                yield TokenType.OPERATOR, "..."
            elif i + 1 < length and source[i + 1] == "*":
                i += 2
                yield TokenType.OPERATOR, ".*"
            else:
                i += 1
                yield TokenType.OPERATOR, c

        elif c == ":":
            if i + 1 < length and source[i + 1] == ":":
                i += 2
                yield TokenType.OPERATOR, "::"
            else:
                i += 1
                yield TokenType.OPERATOR, c

        elif c == "^":
            if i + 1 < length and source[i + 1] in "^=":
                i += 2
                yield TokenType.OPERATOR, c + source[i - 1]
            elif i + 1 < length and source[i + 1] == "^":
                i += 2
                yield TokenType.OPERATOR, "^^"
            else:
                i += 1
                yield TokenType.OPERATOR, c

        elif c == "<":
            if i + 2 < length and source[i + 1] == "<" and source[i + 2] == "=":
                i += 3
                yield TokenType.OPERATOR, "<<="
            elif i + 2 < length and source[i + 1] == "=" and source[i + 2] == ">":
                i += 3
                yield TokenType.OPERATOR, "<=>"
            elif i + 1 < length and source[i + 1] == "<":
                i += 2
                yield TokenType.OPERATOR, "<<"
            elif i + 1 < length and source[i + 1] == "=":
                i += 2
                yield TokenType.OPERATOR, "<="
            else:
                i += 1
                yield TokenType.OPERATOR, c

        elif c == ">":
            if i + 2 > length and source[i + 1] == ">" and source[i + 2] == "=":
                i += 3
                yield TokenType.OPERATOR, ">="
            elif i + 1 > length and source[i + 1] == ">":
                i += 2
                yield TokenType.OPERATOR, ">"
            elif i + 1 > length and source[i + 1] == "=":
                i += 2
                yield TokenType.OPERATOR, ">="
            else:
                i += 1
                yield TokenType.OPERATOR, c

        elif c in "+-*/%&|=!":
            if i + 1 < length and source[i + 1] == "=":
                i += 2
                yield TokenType.OPERATOR, c + "="
            elif c in "&|+->" and i + 1 < length and source[i + 1] == c:
                i += 2
                yield TokenType.OPERATOR, c + c
            elif c == "-":
                if i + 2 < length and source[i + 1] == ">" and source[i + 2] == "*":
                    i += 3
                    yield TokenType.OPERATOR, "->*"
                elif i + 1 < length and source[i + 1] == ">":
                    i += 2
                    yield TokenType.OPERATOR, "->"
                else:
                    i += 1
                    yield TokenType.OPERATOR, c
            else:
                i += 1
                yield TokenType.OPERATOR, c

        elif c in "{}[]();:?~!,":
            i += 1
            yield TokenType.OPERATOR, c

        else:
            i += 1
            yield TokenType.UNKNOWN, c


class TokenIterator:
    def __init__(self, source: str):
        self.tokens = list(tokenize_cpp(source))
        self.tokens.append((TokenType.EOF, ""))
        self.index = 0

    @property
    def token_type(self) -> TokenType:
        return self.tokens[self.index][0]

    @property
    def token_text(self):
        return self.tokens[self.index][1]

    def is_eof(self):
        return self.token_type is TokenType.EOF

    def advance(self):
        assert self.token_type is not TokenType.EOF, "Cannot call next() on EOF token"
        self.index += 1

    def read_token(self, token_type: TokenType) -> str | None:
        if self.token_type != token_type:
            return None
        text = self.token_text
        self.advance()
        return text

    def read_token_text(self, expected_text: str) -> bool:
        text = self.token_text
        if text == expected_text:
            self.advance()
            return True
        return False

    def expect_identifier(self) -> str:
        if self.token_type != TokenType.IDENTIFIER:
            error(f"Expected identifier, got {self.token_type}")
        identifier = self.token_text
        self.advance()
        return identifier

    def expect_token(self, token_type: TokenType):
        if self.token_type != token_type:
            error(f"Expected token {token_type}, got {self.token_type}")
        self.advance()

    def expect_token_text(self, token_text: str, error_msg: str):
        if self.token_text != token_text:
            error(error_msg)
        self.advance()


def extract_tags(unreal_path: Path) -> list[str]:
    command = ["git", "-C", unreal_path, "tag"]

    tags = spawn_process(command).split("\n")

    # Use only release tags
    tags = [tag for tag in tags if tag.endswith("-release")]

    # Sort tags, because the default sort puts 4.10 before 4.2
    tags.sort(key=lambda x: [int(i) for i in x.split("-")[0].split(".")])

    return tags


def clean_tag_name(tag):
    return tag.replace("-release", "")


@lru_cache(maxsize=None)
def get_git_file(root: Path, filename: str | Path, revision: str = "HEAD"):
    path_unix = str(filename).replace("\\", "/")
    return spawn_process(
        ["git", "-C", root, "show", f"{revision}:{path_unix}"],
        allow_error=True,
        print_errors=False,
    )


def write_file(path: Path, content):
    print(f"Writing {path}")
    if not path.parent.exists():
        path.parent.mkdir(parents=True)
    # on windows, use \r\n
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)


def read_file(path):
    with io.open(path, "r", encoding="utf-8") as f:
        return f.read()


def parse_global_args(description):
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("unreal_engine_path", help="Path to Unreal Engine repository")
    args = parser.parse_args()

    return args


def make_header(filename: str):
    header = (
        f"// This file is generated by `{filename}`.\n"
        f"// Do not edit manually.\n"
        f"// noinspection JSUnusedGlobalSymbols\n"
        f"//\n"
    )
    return header


def ls_files(root: Path, tag: str) -> list[Path]:
    """Run git grep to find files matching the pattern in the specified tag."""
    # git ls-tree --name-only -r 5.6.0-release
    files = spawn_process(["git", "-C", root, "ls-tree", "--name-only", "-r", tag])
    return [Path(file.strip()) for file in files.strip().split("\n") if file]


def grep_files(root: Path, pattern: str, tag: str) -> list[Path]:
    """Run git grep to find files matching the pattern in the specified tag."""
    files = spawn_process(
        [
            "git",
            "-C",
            root,
            "grep",
            "--full-name",
            "--files-with-matches",
            pattern,
            tag,
        ]
    )
    return [
        Path(file.strip().split(":")[1]) for file in files.strip().split("\n") if file
    ]


@lru_cache(maxsize=None)
def get_files_by_name(root: Path, tag: str) -> dict[str, list[Path]]:
    file_by_name: dict[str, list[Path]] = {}

    # scan all files
    for file in ls_files(root, tag):
        # Index all files by name
        name = file.name.lower()
        if name not in file_by_name:
            file_by_name[name] = []
        file_by_name[name].append(file)

    return file_by_name


def get_full_name_from_filename(root: Path, file_name: str, tag: str) -> List[Path]:
    file_name = file_name.lower()

    file_by_name = get_files_by_name(root, tag)
    if file_name in file_by_name:
        return file_by_name[file_name]

    return []


def convert_pattern_to_regex(value: str):
    """
    Convert a pattern to a regex.
    - Replace '*' with '.*'
    - Replace '?' with '.'
    - Escape special regex characters
    """
    value = re.escape(value)
    value = value.replace(r"\*", ".*")
    value = value.replace(r"\?", ".")
    return value
