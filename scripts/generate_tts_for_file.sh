#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <markdown-file>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILE_PATH="$1"
TMP_DIR="${TMP_DIR:-$ROOT_DIR/.tts}"
CHUNK_DIR="$TMP_DIR/chunks"
S3_PREFIX="${S3_PREFIX:-s3://yella-blog-assets/audio}"
VOICE_ID="${VOICE_ID:-Matthew}"
REGION="${REGION:-us-west-2}"
ENGINE="${ENGINE:-neural}"
MAX_CHARS="${MAX_CHARS:-2800}"

mkdir -p "$TMP_DIR"

slug="$(/usr/bin/env python3 "$ROOT_DIR/scripts/extract_post_text.py" "$FILE_PATH" --print-slug)"
text_path="$TMP_DIR/$slug.txt"
mp3_path="$TMP_DIR/$slug.mp3"

/usr/bin/env python3 "$ROOT_DIR/scripts/extract_post_text.py" "$FILE_PATH" > "$text_path"

rm -rf "$CHUNK_DIR/$slug"
mkdir -p "$CHUNK_DIR/$slug"

/usr/bin/env python3 "$ROOT_DIR/scripts/chunk_text.py" "$text_path" --max-chars "$MAX_CHARS" --out-dir "$CHUNK_DIR/$slug" --prefix "$slug"

chunk_list=("$CHUNK_DIR/$slug"/"$slug"-*.txt)
chunk_mp3_dir="$CHUNK_DIR/$slug/mp3"
mkdir -p "$chunk_mp3_dir"

idx=0
for chunk in "${chunk_list[@]}"; do
  idx=$((idx + 1))
  chunk_mp3="$chunk_mp3_dir/$slug-$(printf "%03d" "$idx").mp3"
  aws polly synthesize-speech \
    --engine "$ENGINE" \
    --voice-id "$VOICE_ID" \
    --output-format mp3 \
    --region "$REGION" \
    --text file://"$chunk" \
    "$chunk_mp3"
done

if command -v ffmpeg >/dev/null 2>&1; then
  concat_list="$chunk_mp3_dir/concat.txt"
  : > "$concat_list"
  for f in "$chunk_mp3_dir"/"$slug"-*.mp3; do
    echo "file '$f'" >> "$concat_list"
  done
  ffmpeg -hide_banner -loglevel error -f concat -safe 0 -i "$concat_list" -c copy "$mp3_path"
else
  echo "ffmpeg not found; concatenating MP3s with cat (may cause artifacts)." >&2
  cat "$chunk_mp3_dir"/"$slug"-*.mp3 > "$mp3_path"
fi

aws s3 cp "$mp3_path" "$S3_PREFIX/$slug.mp3" --region "$REGION"
echo "Uploaded: $S3_PREFIX/$slug.mp3"
