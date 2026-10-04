"""Bake sand haul roads beneath authored airship attack lanes, with matching build mask."""
from pathlib import Path
import json,math,random
from PIL import Image,ImageDraw,ImageChops,ImageEnhance,ImageFilter,ImageStat
R=Path(__file__).resolve().parents[1];src=R/'source-art/airship-roads'
d=json.loads((src/'map.json').read_text());routes=json.loads((src/'routes.json').read_text())
im=Image.open(src/'desert.jpg').convert('RGB');w,h=im.size;s=w/d['size'][0];width=routes['width']*s
polys=[[(p['x']*s,p['y']*s) for p in r['points']] for r in routes['routes']]
def ribbon(size):
 m=Image.new('L',im.size);b=ImageDraw.Draw(m)
 for p in polys:
  b.line(p,fill=255,width=round(size),joint='curve')
  for x,y in p:b.ellipse((x-size/2,y-size/2,x+size/2,y+size/2),fill=255)
 return m
grid=d['buildTerrain'];cs=grid['cellSize']*s
land=Image.open(R/'assets/airship3-terrain.png').convert('RGBA').getchannel('A').resize(im.size).filter(ImageFilter.GaussianBlur(2))
mask=ImageChops.multiply(ribbon(width),land)
base=im.copy()
# Soft shoulders inherit the existing sand texture rather than covering it with flat color.
for size,brightness,blur in [(width+16,.90,7),(width,.71,3),(width-12,.80,4)]:
 a=ImageChops.multiply(ribbon(size).filter(ImageFilter.GaussianBlur(blur)),land)
 tex=ImageEnhance.Brightness(ImageEnhance.Color(base).enhance(.80)).enhance(brightness)
 im=Image.composite(tex,im,a)
marks=Image.new('RGBA',im.size);b=ImageDraw.Draw(marks);seen=set()
for poly in polys:
 for (x,y),(tx,ty) in zip(poly,poly[1:]):
  length=math.hypot(tx-x,ty-y)
  if length<18:continue
  dx=(tx-x)/length;dy=(ty-y)/length
  for k in range(12,int(length)-10,8):
   cx=x+dx*k;cy=y+dy*k;key=(round(cx/8),round(cy/8))
   if key in seen:continue
   seen.add(key)
   for side in [-1,1]:
    px=cx-dy*width*.23*side;py=cy+dx*width*.23*side
    b.line((px-dy*3,py+dx*3,px+dy*3,py-dx*3),fill=(67,49,34,48),width=1)
    b.line((px+dx-dy*3,py+dy+dx*3,px+dx+dy*3,py+dy-dx*3),fill=(204,165,110,38),width=1)
# Deterministic shoulder grit breaks up the edge; intersections have no internal kerbs.
rng=random.Random(100214);edge=ImageChops.subtract(ribbon(width+10),ribbon(width-10))
for _ in range(25000):
 x=rng.randrange(w);y=rng.randrange(h)
 if edge.getpixel((x,y)) and land.getpixel((x,y)):
  r=rng.choice([.5,1,1.5]);b.ellipse((x-r,y-r,x+r,y+r),fill=(85,66,46,rng.randrange(35,85)));b.point((x,y-1),fill=(207,174,128,85))
marks.putalpha(ImageChops.multiply(marks.getchannel('A'),land));im=Image.alpha_composite(im.convert('RGBA'),marks).convert('RGB');im.save(R/'assets/airship-desert.jpg',quality=88,optimize=True)
cells=list(grid['cells']);added=0
for i,v in enumerate(cells):
 if v!='1':continue
 x=i%grid['cols']*cs;y=i//grid['cols']*cs
 if ImageStat.Stat(mask.crop((int(x),int(y),int(x+cs),int(y+cs)))).mean[0]>=32:cells[i]='2';added+=1
grid['cells']=''.join(cells);d['pavedRoads']=routes
(R/'shared/airship3-data.js').write_text('(function(){const data='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.Defense_airship3=data;})();\n')
print('routes',len(polys),'width',routes['width'],'road cells',added,'jpg bytes',(R/'assets/airship-desert.jpg').stat().st_size)
