"""Tiny PNG reader/writer (8-bit, non-interlaced), so the scripts need no Python packages."""
import struct
import zlib


def read_png(path):
    data = path.read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    pos, idat, palette, trns = 8, b'', None, None
    while pos < len(data):
        n, kind = struct.unpack('>I4s', data[pos:pos + 8])
        body = data[pos + 8:pos + 8 + n]
        pos += 12 + n
        if kind == b'IHDR':
            w, h, depth, ctype, _, _, interlace = struct.unpack('>IIBBBBB', body)
            assert depth == 8 and interlace == 0, path
        elif kind == b'PLTE':
            palette = [body[i:i + 3] for i in range(0, len(body), 3)]
        elif kind == b'tRNS':
            trns = body
        elif kind == b'IDAT':
            idat += body
    channels = {6: 4, 2: 3, 3: 1, 4: 2, 0: 1}[ctype]
    raw, stride = zlib.decompress(idat), w * channels
    rows, prev, i = [], bytearray(stride), 0
    for _ in range(h):
        f, line = raw[i], bytearray(raw[i + 1:i + 1 + stride])
        i += 1 + stride
        for x in range(stride):
            a = line[x - channels] if x >= channels else 0
            b, c = prev[x], prev[x - channels] if x >= channels else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c; pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line)
        prev = line
    px = []
    for line in rows:
        out = []
        for x in range(w):
            p = line[x * channels:(x + 1) * channels]
            if ctype == 6: out.append(tuple(p))
            elif ctype == 2: out.append((*p, 255))
            elif ctype == 4: out.append((p[0], p[0], p[0], p[1]))
            elif ctype == 0: out.append((p[0], p[0], p[0], 255))
            else: out.append((*palette[p[0]], trns[p[0]] if trns and p[0] < len(trns) else 255))
        px.append(out)
    return w, h, px


def write_png(path, w, h, px):
    raw = b''.join(b'\x00' + bytes(c for p in row for c in p) for row in px)
    chunk = lambda k, d: struct.pack('>I', len(d)) + k + d + struct.pack('>I', zlib.crc32(k + d) & 0xffffffff)
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) +
                     chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))


