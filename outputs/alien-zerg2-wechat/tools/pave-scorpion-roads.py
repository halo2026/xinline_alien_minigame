"""Bake full-resolution native steel paving; keep tower exclusion aligned to lanes."""
from pathlib import Path
import json, math, struct
from PIL import Image, ImageDraw, ImageChops, ImageStat, ImageEnhance, ImageFilter
R=Path(__file__).resolve().parents[1]; src=R/'source-art/scorpion-roads'
d=json.loads((src/'map.json').read_text()); routes=json.loads((src/'routes.json').read_text())
# Recover native detail, rather than enlarging the old half-resolution bake.
S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data'
b=(S/'map/world/yxys_scorpion_02.ter').read_bytes();_,_,w,h,_,default,_,_=struct.unpack_from('<4h4i',b)
tiles=[[(default,15)] for _ in range(w*h)];off=24
while off<len(b):
 x,y,count=struct.unpack_from('<hhB',b,off);off+=5;ls=[]
 for _ in range(count):ls.append(struct.unpack_from('BB',b,off));off+=2
 tiles[y*w+x]=ls
textures={n:Image.open(S/'terrain'/f't_{12 if n==9 else n:02}.png').convert('RGBA') for ls in tiles for n,a in ls if n}
alpha=Image.open(S/'terrain/alpha01.png').convert('RGBA');im=Image.new('RGBA',(w*64,h*64))
for y in range(h):
 for x in range(w):
  for n,a in tiles[y*w+x]:
   if not n:break
   if not a:continue
   tex=textures[n];tw,th=tex.size
   tx,ty=((256+x%4*64,y%4*64) if a==15 else (a%4*64,a//4*64)) if tw==512 else (x%(tw//64)*64,y%(th//64)*64)
   tile=tex.crop((tx,ty,tx+64,ty+64))
   if a!=15 and tw!=512:tile.putalpha(ImageChops.multiply(tile.getchannel('A'),alpha.crop((((a-1)%4)*64,((a-1)//4)*64,((a-1)%4+1)*64,((a-1)//4+1)*64)).getchannel('A')))
   im.alpha_composite(tile,(x*64,y*64))
w,h=im.size;scale=w/d['size'][0];width=routes['width']*scale
polys=[[(p['x']*scale,p['y']*scale) for p in r['points']] for r in routes['routes']]
def ribbon(size):
 m=Image.new('L',im.size);b=ImageDraw.Draw(m)
 for p in polys:
  b.line(p,fill=255,width=round(size),joint='curve')
  for x,y in p:b.ellipse((x-size/2,y-size/2,x+size/2,y+size/2),fill=255)
 return m
land=im.getchannel('A');mask=ImageChops.multiply(ribbon(width),land)
base=im.copy()
# Recessed edge and steel bevels use the same native texture as the room floor.
for size,brightness in [(width+10,.88),(width+4,.55),(width,1.18),(width-4,.48),(width-9,.70)]:
 texture=ImageEnhance.Brightness(base).enhance(brightness)
 a=ImageChops.multiply(ribbon(size),land)
 if size==width+10:a=a.filter(ImageFilter.GaussianBlur(3));a=ImageChops.multiply(a,land)
 im=Image.composite(texture,im,a)
lines=Image.new('RGBA',im.size);b=ImageDraw.Draw(lines)
for poly in polys:
 for (x,y),(tx,ty) in zip(poly,poly[1:]):
  length=math.hypot(tx-x,ty-y)
  if length<1:continue
  dx=(tx-x)/length;dy=(ty-y)/length
  for k in range(32,int(length)-20,64):
   cx=x+dx*k;cy=y+dy*k;r=width/2-11
   b.line((cx-dy*r,cy+dx*r,cx+dy*r,cy-dx*r),fill=(9,15,22,125),width=2)
   b.line((cx+dx*2-dy*r,cy+dy*2+dx*r,cx+dx*2+dy*r,cy+dy*2-dx*r),fill=(111,127,145,90),width=1)
   for side in [-1,1]:
    px=cx-dy*(r-5)*side;py=cy+dx*(r-5)*side
    b.ellipse((px-2,py-2,px+2,py+2),fill=(13,20,28,160));b.point((round(px),round(py-1)),fill=(124,140,155,155))
  # Sparse inset blue steel markers, matching the native floor circuitry.
  for k in range(48,int(length)-24,160):
   for side in [-1,1]:
    ox=-dy*(width/2-16)*side;oy=dx*(width/2-16)*side
    b.line((x+dx*k+ox,y+dy*k+oy,x+dx*(k+14)+ox,y+dy*(k+14)+oy),fill=(81,113,146,150),width=2)
lines.putalpha(ImageChops.multiply(lines.getchannel('A'),ImageChops.multiply(ribbon(width-12),land)));im=Image.alpha_composite(im,lines)
# Palette compression retains native pixel dimensions and saves package space.
im.quantize(colors=192,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save(R/'assets/scorpion2-terrain.png',optimize=True)
grid=d['buildTerrain'];cs=grid['cellSize']*scale;cells=list(grid['cells']);added=0
for i,v in enumerate(cells):
 if v!='1':continue
 x=i%grid['cols']*cs;y=i//grid['cols']*cs
 if ImageStat.Stat(mask.crop((int(x),int(y),int(x+cs),int(y+cs)))).mean[0]>=32:cells[i]='2';added+=1
grid['cells']=''.join(cells);d['pavedRoads']=routes
(R/'shared/scorpion2-data.js').write_text('(function(){const data='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.Defense_scorpion2=data;})();\n')
print('Paved routes:',len(polys),'width:',routes['width'],'size:',im.size,'new non-buildable cells:',added,'terrain bytes:',(R/'assets/scorpion2-terrain.png').stat().st_size)
