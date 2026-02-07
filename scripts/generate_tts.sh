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

  text_path="$TMP_DIR/$slug.txt"
  mp3_path="$TMP_DIR/$slug.mp3"

  /usr/bin/env python3 "$ROOT_DIR/scripts/extract_post_text.py" "$file" > "$text_path"

  aws polly synthesize-speech \
    --engine "$ENGINE" \
    --voice-id "$VOICE_ID" \
    --output-format mp3 \
    --region "$REGION" \
    --text file://"$text_path" \
    "$mp3_path"

  aws s3 cp "$mp3_path" "$S3_PREFIX/$slug.mp3" --region "$REGION"
  echo "Uploaded: $S3_PREFIX/$slug.mp3"
done
