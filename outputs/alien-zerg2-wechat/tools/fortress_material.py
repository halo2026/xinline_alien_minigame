"""Render fortress deck art with the native cyan hue and clearer glass; no collision edits."""
from pathlib import Path
import struct
from PIL import Image,ImageChops
GLASS_OPACITY=.65
def render(tiles,w,h,source):
 textures={n:Image.open(source/'terrain'/f't_{n:02}.png').convert('RGBA') for layers in tiles for n,a in layers if n}
 glass=textures[11].copy();glass.putalpha(glass.getchannel('A').point(lambda a:round(a*GLASS_OPACITY)));textures[11]=glass
 mask=Image.open(source/'terrain/alpha01.png').getchannel('A');out=Image.new('RGBA',(w*64,h*64))
 for y in range(h):
  for x in range(w):
   for n,a in tiles[y*w+x]:
    if not n:break
    if not a:continue
    tex=textures[n];tw,th=tex.size;tx,ty=((256+x%4*64,y%4*64) if a==15 else (a%4*64,a//4*64)) if tw==512 else (x%(tw//64)*64,y%(th//64)*64);im=tex.crop((tx,ty,tx+64,ty+64))
    if a!=15 and tw!=512:im.putalpha(ImageChops.multiply(im.getchannel('A'),mask.crop((((a-1)%4)*64,((a-1)//4)*64,((a-1)%4+1)*64,((a-1)//4+1)*64))))
    out.alpha_composite(im,(x*64,y*64))
 return out
if __name__=='__main__':
 r=Path(__file__).resolve().parents[1];source=r.parent/'alien-mac/source/XLFramework/Projects/alien_source/data';b=(source/'map/world/yxys_mechanics_002.ter').read_bytes();_,_,w,h,_,default,_,_=struct.unpack_from('<4h4i',b);tiles=[[(default,15)] for _ in range(w*h)];off=24
 while off<len(b):
  x,y,count=struct.unpack_from('<hhB',b,off);off+=5;layers=[]
  for _ in range(count):layers.append(struct.unpack_from('BB',b,off));off+=2
  tiles[y*w+x]=layers
 out=render(tiles,w,h,source);out.resize((w*32,h*32),Image.Resampling.LANCZOS).quantize(colors=192,method=Image.Quantize.FASTOCTREE).save(r/'assets/fortress2-terrain.png',optimize=True)
 print('Fortress glass: native RGB retained, opacity 65%; navigation untouched')
