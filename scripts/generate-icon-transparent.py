#!/usr/bin/env python3
"""Create transparent PNG from UI/icon.png for auth screens."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "UI" / "icon.png"
OUT_ASSETS = ROOT / "assets" / "icon_transparent.png"
OUT_UI = ROOT / "UI" / "icon_transparent.png"
BG_TOLERANCE = 38


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    px = im.load()
    w, h = im.size

    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if (
                abs(r - bg[0]) <= BG_TOLERANCE
                and abs(g - bg[1]) <= BG_TOLERANCE
                and abs(b - bg[2]) <= BG_TOLERANCE
            ):
                px[x, y] = (r, g, b, 0)

    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)

    side = max(im.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    ox = (side - im.size[0]) // 2
    oy = (side - im.size[1]) // 2
    canvas.paste(im, (ox, oy), im)
    canvas = canvas.resize((1024, 1024), Image.LANCZOS)

    canvas.save(OUT_ASSETS, optimize=True)
    canvas.save(OUT_UI, optimize=True)
    print(f"✓ Wrote {OUT_ASSETS} and {OUT_UI}")


if __name__ == "__main__":
    main()
