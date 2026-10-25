"""Katarina's notebook drawn like a game screen: leather cover, paper, tabs and buttons as small pixel-art pieces.

Uso: python3 -B scripts/notebook-ui.py

Each piece is a tiny PNG (one pixel = one art pixel); the CSS shows them 4x bigger with image-rendering: pixelated.
The frames are nine-slices for border-image (outline, a lit top-left edge, a dark bottom-right edge, corners cut in
steps), the fills are tiles. Writes src/assets/ui/.
"""
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from png import write_png  # noqa: E402

OUT = Path(__file__).resolve().parents[1] / 'src/assets/ui'
hexc = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
CLEAR = (0, 0, 0, 0)
LINE = hexc('#1e140c')
LEATHER = [hexc(c) for c in ('#432716', '#4d2e1a', '#56331e', '#5e3921')]
LEATHER_LIT, LEATHER_DARK, STITCH = hexc('#7d5032'), hexc('#2f1b0f'), hexc('#c9a56a')
PAPER = [hexc(c) for c in ('#e9dcbc', '#e9dcbc', '#e5d7b5', '#ede2c6')]
PAPER_LIT, PAPER_DARK, RULE, PAPER_LINE = hexc('#f6eedb'), hexc('#c4b085'), hexc('#d2bf94'), hexc('#4a3420')
TAB = [hexc(c) for c in ('#cdbb90', '#c8b58a')]
BTN, BTN_HOVER, BTN_LIT, BTN_DARK = hexc('#4a2c18'), hexc('#6b4228'), hexc('#8a5c3a'), hexc('#24150b')


def save(name, rows):
    write_png(OUT / f'{name}.png', len(rows[0]), len(rows), rows)


def frame(n, edge, fill, lit, dark, cut=1, open_bottom=False):
    """n x n nine-slice: 1 px outline, 1 px bevel, then fill; corners stepped by `cut` pixels."""
    rows = [[fill(x, y) for x in range(n)] for y in range(n)]
    for y in range(n):
        for x in range(n):
            d = min(x, y, n - 1 - x, n - 1 - y if not open_bottom else n)
            if d == 0:
                rows[y][x] = edge
            elif d == 1:
                rows[y][x] = lit if (x == 1 or y == 1) and x < n - 2 and (y < n - 2 or open_bottom) else dark
    # Cut corners: the corner pixel goes, the outline steps in.
    corners = [(0, 0), (n - 1, 0)] + ([] if open_bottom else [(0, n - 1), (n - 1, n - 1)])
    for cx, cy in corners:
        sx, sy = (1 if cx == 0 else -1), (1 if cy == 0 else -1)
        rows[cy][cx] = CLEAR
        if cut:
            rows[cy + sy][cx + sx] = edge
    return rows


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rnd = random.Random(5)
    # Leather: a coarse grain, darker flecks.
    save('leather', [[rnd.choice(LEATHER) if rnd.random() > .06 else LEATHER_DARK for _ in range(16)] for _ in range(16)])
    # Cover frame (12 x 12, slice 4): outline, bevel, leather, then a stitched seam that repeats every 4 px.
    cover = frame(12, LINE, lambda x, y: LEATHER[2], LEATHER_LIT, LEATHER_DARK)
    for i in range(3, 9):
        on = (i // 2) % 2 == 0
        for x, y in ((i, 3), (i, 8), (3, i), (8, i)):
            cover[y][x] = STITCH if on else LEATHER[2]
    save('cover', cover)
    # Paper: tile with grain and one ruled line every 8 art px (32 px on screen, the text's line height).
    tile = [[rnd.choice(PAPER) for _ in range(16)] for _ in range(8)]
    tile[7] = [RULE] * 16
    save('paper', tile)
    save('paper_frame', frame(6, PAPER_LINE, lambda x, y: PAPER[0], PAPER_LIT, PAPER_DARK))
    # Tabs: open at the bottom so the selected one runs into the page.
    save('tab', frame(6, PAPER_LINE, lambda x, y: TAB[0], hexc('#ddd0ab'), TAB[1], open_bottom=True))
    save('tab_on', frame(6, PAPER_LINE, lambda x, y: PAPER[0], PAPER_LIT, PAPER[0], open_bottom=True))
    # Buttons like the game's, in leather: outline, lit top-left, dark bottom-right.
    for name, fill in (('btn', BTN), ('btn_hover', BTN_HOVER)):
        save(name, frame(6, LINE, lambda x, y: fill, BTN_LIT, BTN_DARK, cut=0))
    # Arrows, 7 x 7, in paper.
    shape = ['...#...', '..##...', '.######', '#######', '.######', '..##...', '...#...']
    left = [[PAPER[0] if c == '#' else CLEAR for c in row] for row in shape]
    save('arrow_l', left)
    save('arrow_r', [row[::-1] for row in left])
    print('ok')


if __name__ == '__main__':
    main()
