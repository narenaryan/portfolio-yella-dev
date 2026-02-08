#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTENT_DIR="$ROOT_DIR/content/blog"
TMP_DIR="$ROOT_DIR/.tts"
S3_PREFIX="s3://yella-blog-assets/audio"
REGION="us-west-2"
OPENAI_TTS_MODEL="gpt-4o-mini-tts"
OPENAI_TTS_VOICE="ash"
OPENAI_TTS_INSTRUCTIONS="An essay style story telling"
OPENAI_TTS_FORMAT="mp3"

mkdir -p "$TMP_DIR"

for file in "$CONTENT_DIR"/*.md; do
  slug="$(/usr/bin/env python3 "$ROOT_DIR/scripts/extract_post_text.py" "$file" --print-slug)"

  S3_PREFIX="$S3_PREFIX" REGION="$REGION" \
  OPENAI_TTS_MODEL="$OPENAI_TTS_MODEL" OPENAI_TTS_VOICE="$OPENAI_TTS_VOICE" \
  OPENAI_TTS_INSTRUCTIONS="$OPENAI_TTS_INSTRUCTIONS" OPENAI_TTS_FORMAT="$OPENAI_TTS_FORMAT" \
    /usr/bin/env bash "$ROOT_DIR/scripts/generate_tts_for_file.sh" "$file"
done
