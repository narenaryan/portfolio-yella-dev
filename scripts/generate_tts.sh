#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTENT_DIR="$ROOT_DIR/content/blog"
TMP_DIR="$ROOT_DIR/.tts"
S3_PREFIX="s3://yella-blog-assets/audio"
VOICE_ID="Matthew"
REGION="us-west-2"
ENGINE="neural"

mkdir -p "$TMP_DIR"

for file in "$CONTENT_DIR"/*.md; do
  slug="$(/usr/bin/env python3 "$ROOT_DIR/scripts/extract_post_text.py" "$file" --print-slug)"

  S3_PREFIX="$S3_PREFIX" VOICE_ID="$VOICE_ID" REGION="$REGION" ENGINE="$ENGINE" \
    /usr/bin/env bash "$ROOT_DIR/scripts/generate_tts_for_file.sh" "$file"
done
