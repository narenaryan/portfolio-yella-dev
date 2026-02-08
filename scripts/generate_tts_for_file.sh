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
REGION="${REGION:-us-west-2}"
MAX_CHARS="${MAX_CHARS:-2800}"

OPENAI_TTS_MODEL="${OPENAI_TTS_MODEL:-gpt-4o-mini-tts}"
OPENAI_TTS_VOICE="${OPENAI_TTS_VOICE:-ash}"
OPENAI_TTS_INSTRUCTIONS="${OPENAI_TTS_INSTRUCTIONS:-An essay style story telling}"
OPENAI_TTS_FORMAT="${OPENAI_TTS_FORMAT:-mp3}"

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "OPENAI_API_KEY is required." >&2
  exit 1
fi

mkdir -p "$TMP_DIR"

slug="$(/usr/bin/env python3 "$ROOT_DIR/scripts/extract_post_text.py" "$FILE_PATH" --print-slug)"
text_path="$TMP_DIR/$slug.txt"
audio_path="$TMP_DIR/$slug.$OPENAI_TTS_FORMAT"

/usr/bin/env python3 "$ROOT_DIR/scripts/extract_post_text.py" "$FILE_PATH" > "$text_path"

rm -rf "$CHUNK_DIR/$slug"
mkdir -p "$CHUNK_DIR/$slug"

/usr/bin/env python3 "$ROOT_DIR/scripts/chunk_text.py" "$text_path" --max-chars "$MAX_CHARS" --out-dir "$CHUNK_DIR/$slug" --prefix "$slug"

chunk_list=("$CHUNK_DIR/$slug"/"$slug"-*.txt)
chunk_audio_dir="$CHUNK_DIR/$slug/$OPENAI_TTS_FORMAT"
mkdir -p "$chunk_audio_dir"

idx=0
for chunk in "${chunk_list[@]}"; do
  idx=$((idx + 1))
  chunk_audio="$chunk_audio_dir/$slug-$(printf "%03d" "$idx").$OPENAI_TTS_FORMAT"
  /usr/bin/env python3 - "$chunk" <<'PY' | curl -sS https://api.openai.com/v1/audio/speech \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d @- \
    --output "$chunk_audio"
import json
import os
import sys

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

payload = {
    "model": os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts"),
    "voice": os.getenv("OPENAI_TTS_VOICE", "ash"),
    "instructions": os.getenv("OPENAI_TTS_INSTRUCTIONS", "An essay style story telling"),
    "input": text,
    "response_format": os.getenv("OPENAI_TTS_FORMAT", "mp3"),
}
print(json.dumps(payload))
PY
done

if command -v ffmpeg >/dev/null 2>&1; then
  concat_list="$chunk_audio_dir/concat.txt"
  : > "$concat_list"
  for f in "$chunk_audio_dir"/"$slug"-*."$OPENAI_TTS_FORMAT"; do
    echo "file '$f'" >> "$concat_list"
  done
  ffmpeg -hide_banner -loglevel error -f concat -safe 0 -i "$concat_list" -c copy "$audio_path"
else
  echo "ffmpeg not found; concatenating audio with cat (may cause artifacts)." >&2
  cat "$chunk_audio_dir"/"$slug"-*."$OPENAI_TTS_FORMAT" > "$audio_path"
fi

aws s3 cp "$audio_path" "$S3_PREFIX/$slug.$OPENAI_TTS_FORMAT" --region "$REGION"
echo "Uploaded: $S3_PREFIX/$slug.$OPENAI_TTS_FORMAT"
