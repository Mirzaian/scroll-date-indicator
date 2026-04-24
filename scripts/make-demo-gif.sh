#!/usr/bin/env bash
# Konvertiert eine macOS-Bildschirmaufnahme (.mov) in ein optimiertes GIF
# und kopiert sie nach scroll-date-indicator/docs/media/demo.gif
#
# Aufruf:  ./scripts/make-demo-gif.sh <pfad-zur-aufnahme.mov> [breite=900] [fps=20]
#
# Beispiel: ./scripts/make-demo-gif.sh ~/Desktop/Bildschirmaufnahme*.mov

set -euo pipefail

INPUT="${1:-}"
WIDTH="${2:-900}"
FPS="${3:-20}"

if [[ -z "$INPUT" ]]; then
  # Auto-pick neueste .mov auf dem Desktop
  INPUT=$(ls -t "$HOME/Desktop"/*.mov 2>/dev/null | head -n 1 || true)
  if [[ -z "$INPUT" ]]; then
    echo "Bitte Pfad zur .mov-Datei angeben (oder Aufnahme auf dem Desktop liegen lassen)."
    exit 1
  fi
  echo "→ Nutze neueste Aufnahme: $INPUT"
fi

if [[ ! -f "$INPUT" ]]; then
  echo "Datei nicht gefunden: $INPUT"
  exit 1
fi

OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/docs/media"
mkdir -p "$OUT_DIR"

TMP_PALETTE=$(mktemp -t palette).png
TMP_GIF=$(mktemp -t demo).gif
FINAL="$OUT_DIR/demo.gif"

echo "→ Erzeuge Farbpalette …"
ffmpeg -y -i "$INPUT" \
  -vf "fps=${FPS},scale=${WIDTH}:-1:flags=lanczos,palettegen=stats_mode=diff" \
  "$TMP_PALETTE" 2>&1 | tail -3

echo "→ Erzeuge GIF (${WIDTH}px @ ${FPS}fps) …"
ffmpeg -y -i "$INPUT" -i "$TMP_PALETTE" \
  -lavfi "fps=${FPS},scale=${WIDTH}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
  "$TMP_GIF" 2>&1 | tail -3

echo "→ Optimiere mit gifsicle …"
gifsicle -O3 --lossy=80 "$TMP_GIF" -o "$FINAL"

SIZE=$(du -h "$FINAL" | awk '{print $1}')
echo ""
echo "✓ Fertig: $FINAL  ($SIZE)"
echo "  → README.md zeigt es bereits über docs/media/demo.gif an."

rm -f "$TMP_PALETTE" "$TMP_GIF"
