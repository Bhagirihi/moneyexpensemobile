#!/usr/bin/env bash
# Regenerate Trivense brand PNGs from the canonical UI icon.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/UI/icon.png"

cp "$SRC" "$ROOT/assets/icon.png"
cp "$SRC" "$ROOT/assets/splash_icon.png"
cp "$SRC" "$ROOT/UI/splash_icon.png"

if command -v python3 >/dev/null 2>&1; then
  python3 "$ROOT/scripts/generate-icon-transparent.py" 2>/dev/null || true
fi

if command -v sips >/dev/null 2>&1; then
  sips -z 512 512 "$SRC" --out "$ROOT/store-assets/play/app_icon_512.png" >/dev/null
fi

cp "$SRC" "$ROOT/website/public/logo.png"
cp "$SRC" "$ROOT/website/src/app/icon.png"
cp "$SRC" "$ROOT/website/src/app/apple-icon.png"

echo "✓ Brand assets synced from UI/icon.png (website + store icon included)"
