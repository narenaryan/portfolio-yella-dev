#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path


def split_sentences(text: str) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if p.strip()]


def chunk_text(sentences: list[str], max_chars: int) -> list[str]:
    chunks = []
    current = ""
    for sentence in sentences:
        if len(sentence) > max_chars:
            for i in range(0, len(sentence), max_chars):
                piece = sentence[i : i + max_chars].strip()
                if piece:
                    if current:
                        chunks.append(current)
                        current = ""
                    chunks.append(piece)
            continue
        if not current:
            current = sentence
            continue
        if len(current) + 1 + len(sentence) <= max_chars:
            current = f"{current} {sentence}"
        else:
            chunks.append(current)
            current = sentence
    if current:
        chunks.append(current)
    return chunks


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("--max-chars", type=int, default=2800)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--prefix", required=True)
    args = parser.parse_args()

    text = Path(args.input).read_text(encoding="utf-8")
    sentences = split_sentences(text)
    chunks = chunk_text(sentences, args.max_chars)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, chunk in enumerate(chunks, start=1):
        out_path = out_dir / f"{args.prefix}-{i:03d}.txt"
        out_path.write_text(chunk, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
