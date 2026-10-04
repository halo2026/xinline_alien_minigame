"""Extract original random-maze near-object atlas (run with Pillow Python)."""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
source = root.parent / 'alien-mac/source/XLFramework/Projects/alien_source/data/image/maze/mazeskin_highwall_001.png'
s = Image.open(source).convert('RGBA')
out = Image.new('RGBA', (640, 64))
rects = [(2, 770, 252), (258, 770, 252)] + [(x*128+2, y*128+2, 124) for y in (6,7) for x in (4,5,6,7)]
for i, (x,y,w) in enumerate(rects):
    out.paste(s.crop((x,y,x+w,y+w)).resize((64,64), Image.Resampling.LANCZOS), (i*64,0))
out.quantize(colors=96,method=Image.Quantize.FASTOCTREE).save(root/'assets/space-debris.png',optimize=True)
