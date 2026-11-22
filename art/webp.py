"""Mengubah hasil render (art/out/*.png) jadi WebP di public/art. Jalankan setelah art/render.js.

    python3 art/webp.py            semua sprite
    python3 art/webp.py lilin      hanya yang namanya mengandung "lilin"
"""
import os, sys
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
src, dst = os.path.join(here, 'out'), os.path.join(here, '..', 'public', 'art')
os.makedirs(dst, exist_ok=True)
total = 0
only = [a for a in sys.argv[1:] if a != 'v']
for f in sorted(os.listdir(src)):
    if not f.endswith('.png') or f.startswith('_'):
        continue
    if only and not any(o in f for o in only):
        continue
    name = f[:-4]
    im = Image.open(os.path.join(src, f))
    if name.startswith('bg-'):
        im = im.convert('RGB')
        im.save(os.path.join(dst, name + '.webp'), 'WEBP', quality=80, method=6)
    elif name.startswith('tex-'):
        im.save(os.path.join(dst, name + '.webp'), 'WEBP', quality=55, method=6, alpha_quality=60)
    else:
        im = im.convert('RGBA')
        im.save(os.path.join(dst, name + '.webp'), 'WEBP', quality=86, method=6, alpha_quality=92)
    size = os.path.getsize(os.path.join(dst, name + '.webp'))
    total += size
    if True:
        print(f'{name:28s} {im.size[0]}x{im.size[1]}  {size/1024:6.1f} KB')
print(f'total {total/1024:.0f} KB')
