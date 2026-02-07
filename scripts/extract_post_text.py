#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import re
import sys

try:
    import tomllib
except ModuleNotFoundError:  # pragma: no cover
    import tomli as tomllib  # type: ignore


FRONT_MATTER_DELIM = "+++"


def split_front_matter(raw: str) -> tuple[dict, str]:
    lines = raw.splitlines()
    if not lines or lines[0].strip() != FRONT_MATTER_DELIM:
        return {}, raw
    try:
        end_idx = lines[1:].index(FRONT_MATTER_DELIM) + 1
    except ValueError:
        return {}, raw
    fm_text = "\n".join(lines[1:end_idx])
    body = "\n".join(lines[end_idx + 1 :])
    try:
        fm = tomllib.loads(fm_text)
    except Exception:
        fm = {}
    return fm, body


def markdown_to_text(md: str) -> str:
    text = md
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"`[^`]*`", " ", text)
    text = re.sub(r"!\[([^\]]*)\]\([^)]+\)", r" \1 ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r" \1 ", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.M)
    text = re.sub(r"^>\s?", "", text, flags=re.M)
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.M)
    text = re.sub(r"^\s*\d+\.\s+", "", text, flags=re.M)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&nbsp;|&amp;|&lt;|&gt;", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    parser.add_argument("--slug", default="")
    parser.add_argument("--print-slug", action="store_true")
    args = parser.parse_args()

    with open(args.path, "r", encoding="utf-8") as f:
        raw = f.read()

    fm, body = split_front_matter(raw)
    slug = args.slug or fm.get("slug") or os.path.splitext(os.path.basename(args.path))[0]
    if args.print_slug:
        sys.stdout.write(slug)
        return 0
    title = fm.get("title", "")
    text = markdown_to_text(body)
    if title:
        text = f"{title}. {text}"

    sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
