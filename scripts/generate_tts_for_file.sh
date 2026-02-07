#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <markdown-file>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILE_PATH="$1"
TMP_DIR="${TMP_DIR:-$ROOT_DIR/.tts}"
S3_PREFIX="${S3_PREFIX:-s3://yella-blog-assets/audio}"
VOICE_ID="${VOICE_ID:-Matthew}"
REGION="${REGION:-us-west-2}"
ENGINE="${ENGINE:-neural}"

mkdir -p "$TMP_DIR"

slug="$(/usr/bin/env python3 "$ROOT_DIR/scripts/extract_post_text.py" "$FILE_PATH" --print-slug)"
text_path="$TMP_DIR/$slug.txt"
mp3_path="$TMP_DIR/$slug.mp3"

/usr/bin/env python3 "$ROOT_DIR/scripts/extract_post_text.py" "$FILE_PATH" > "$text_path"

aws polly synthesize-speech \
  --engine "$ENGINE" \
  --voice-id "$VOICE_ID" \
  --output-format mp3 \
  --region "$REGION" \
  --text file://"$text_path" \
  "$mp3_path"

aws s3 cp "$mp3_path" "$S3_PREFIX/$slug.mp3" --region "$REGION"
echo "Uploaded: $S3_PREFIX/$slug.mp3"
