"""Regression: opaque 512px materials must not become solid edge squares."""
from pathlib import Path
import runpy
from PIL import ImageChops
s=runpy.run_path(str(Path(__file__).resolve().parents[1]/'tools/compose-strategic-terrain.py'))
for tid in (4,5):
 for mask in range(1,15):
  tile=s['tile'](tid,mask,3,2)
  x,y=(mask-1)%4*64,(mask-1)//4*64
  expected=s['alpha_atlas'].crop((x,y,x+64,y+64)).getchannel('A')
  assert ImageChops.difference(tile.getchannel('A'),expected).getbbox() is None
  assert tile.getchannel('A').getextrema()[0]<20, (tid,mask)
 # Complete material preserves its global UV phase across tile boundaries.
 actual=s['tile'](tid,15,3,2)
 assert ImageChops.difference(actual,s['textures'][tid].crop((448,128,512,192))).getbbox() is None
for mask in range(1,15):
 x,y=mask%4*64,mask//4*64
 assert ImageChops.difference(s['tile'](6,mask,3,2),s['textures'][6].crop((x,y,x+64,y+64))).getbbox() is None
print('PASS: 28 material transitions, global material UVs, 14 native road transitions')

# No full cell may sample the atlas left half (contains baked corner patches).
for tid in (4,5):
 for y in range(4):
  for x in range(8):
   tx,ty=256+x%4*64,y*64
   expected=s['textures'][tid].crop((tx,ty,tx+64,ty+64))
   assert ImageChops.difference(s['tile'](tid,15,x,y),expected).getbbox() is None
print('PASS: 64 full-terrain cells exclude pre-shaded transition atlas')
