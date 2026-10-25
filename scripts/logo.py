"""The site's logo and favicon, from Rodrigo's drawing in art/marca/logo.png.

Uso: python3 -B scripts/logo.py

Crops the drawing to its opaque part (square, with a little margin) and shrinks it by area average with
premultiplied alpha, so the dark outline stays solid. Writes public/assets/monograma_{32,64,256}.png.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from png import read_png, write_png  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]


def main():
    w, h, px = read_png(ROOT / 'art/marca/logo.png')
    at = (lambda x, y: px[y][x]) if len(px) == h else (lambda x, y: px[y * w + x])
    opaque = [(x, y) for y in range(0, h, 2) for x in range(0, w, 2) if at(x, y)[3] > 128]
    x0, x1 = min(p[0] for p in opaque), max(p[0] for p in opaque)
    y0, y1 = min(p[1] for p in opaque), max(p[1] for p in opaque)
    side = int(max(x1 - x0, y1 - y0) * 1.04)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    ox, oy = cx - side // 2, cy - side // 2
    for size in (32, 64, 256):
        out = []
        for Y in range(size):
            row = []
            for X in range(size):
                ax, bx = ox + X * side // size, ox + (X + 1) * side // size
                ay, by = oy + Y * side // size, oy + (Y + 1) * side // size
                r = g = b = a = n = 0
                for y in range(ay, by):
                    for x in range(ax, bx):
                        n += 1
                        if 0 <= x < w and 0 <= y < h:
                            p = at(x, y)
                            r += p[0] * p[3]; g += p[1] * p[3]; b += p[2] * p[3]; a += p[3]
                row.append((r // a, g // a, b // a, a // n) if a else (0, 0, 0, 0))
            out.append(row)
        write_png(ROOT / f'public/assets/monograma_{size}.png', size, size, out)
        print(size)


if __name__ == '__main__':
    main()
