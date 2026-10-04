"""Compile native 64px / four-corner terrain tiles, TER, collision and build mask."""
from pathlib import Path
from PIL import Image,ImageFilter,ImageStat,ImageChops
import json,math,struct,sys
R=Path(__file__).resolve().parents[1];B=R/'source-map/strategic-base';S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data'
def read(p):
 s=p.read_text();return json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')])
def write(p,d,name):p.write_text('(function(){const d='+json.dumps(d,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.'+name+'=d;})();')
current='--current' in sys.argv
d=read((R/'shared' if current else B)/'level-data.js');a=read((R/'shared' if current else B)/'art-data.js');W,H=1920,2176;cols,rows=W//64,H//64
# Reuse native land silhouette, expand its actual playable perimeter, not just canvas.
old=Image.open(B/'terrain.png').convert('RGBA');small=old.resize((old.width//16,old.height//16)).convert('RGB');land=Image.new('L',(W//16,H//16));mask=small.point(lambda v:255 if v>35 else 0).convert('L').point(lambda v:255 if v>0 else 0);land.paste(mask,(0,0));land=land.filter(ImageFilter.MaxFilter(13))
for y in range(land.height):
 for x in range(land.width):
  if x*16<96 or y*16<64 or x*16>W-192 or y*16>1856:land.putpixel((x,y),0)
def visible(x,y):return 0<=x<W and 0<=y<H and land.getpixel((min(land.width-1,int(x)//16),min(land.height-1,int(y)//16)))>128
segments=[]
for p in d['strategicRoads']['routes']:
 for u,v in zip(p,p[1:]):segments.append((u,v,58))
for p in d['strategicRoads']['entries'].values():
 for u,v in zip(p,p[1:]):segments.append((u,v,70))
def distance(x,y,u,v):
 dx=v['x']-u['x'];dy=v['y']-u['y'];t=max(0,min(1,((x-u['x'])*dx+(y-u['y'])*dy)/(dx*dx+dy*dy or 1)));return math.hypot(x-u['x']-t*dx,y-u['y']-t*dy)
def road(x,y,extra=0):return any(distance(x,y,u,v)<=radius+extra for u,v,radius in segments)
def corners(x,y,pred):return sum(bit for dx,dy,bit in [(0,0,8),(64,0,4),(0,64,2),(64,64,1)] if pred(x+dx,y+dy))
textures={n:Image.open(S/'terrain'/f't_{n:02}.png').convert('RGBA') for n in [4,5,6]}
alpha_atlas=Image.open(S/'terrain/alpha01.png').convert('RGBA')
def tile(tid,alpha,x,y):
 tex=textures[tid]
 # t04/t05 have opaque, pre-shaded transition cells on the LEFT.
 # Only the RIGHT 256x256 region is continuous full terrain.
 # Reuse that material with the native shared alpha mask for transitions.
 if tex.getchannel('A').getextrema()[0] == 255:
  tx,ty=256+x%4*64,y%4*64
  im=tex.crop((tx,ty,tx+64,ty+64))
  if alpha!=15:
   ax,ay=(alpha-1)%4*64,(alpha-1)//4*64
   im.putalpha(alpha_atlas.crop((ax,ay,ax+64,ay+64)).getchannel('A'))
  return im
 tx,ty=(256+x%4*64,y%4*64) if alpha==15 else (alpha%4*64,alpha//4*64)
 return tex.crop((tx,ty,tx+64,ty+64))

ground=Image.new('RGBA',(W,H));roadmask=Image.new('L',(W,H));landmask=Image.new('L',(W,H));tiles=[]
for y in range(rows):
 for x in range(cols):
  px,py=x*64,y*64;ls=[];base=corners(px,py,visible)
  if base:
   ls.append([4,base]);im=tile(4,base,x,y);ground.alpha_composite(im,(px,py));landmask.paste(im.getchannel('A'),(px,py))
   for tid,extra in [(5,40),(6,0)]:
    bits=corners(px,py,lambda xx,yy:visible(xx,yy) and road(xx,yy,extra))
    if bits:
     ls.append([tid,bits]);im=tile(tid,bits,x,y);ground.alpha_composite(im,(px,py))
     if tid==6:roadmask.paste(im.getchannel('A'),(px,py))
  tiles.append(ls or [[0,0]])
# Quantize only after compositing; never quantize the source alpha masks.
ground.quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets/terrain.png',optimize=True)
# Move only perimeter cliffs; keep interior rocks and all gameplay anchors unchanged.
blocks=set()
for prop in a['props']:
 x,y=prop['x'],prop['y'];dx=-96 if x<350 else 96 if x>1480 else 0;dy=-96 if y<220 else 96 if y>1500 else 0
 if current:dx=dy=0
 prop['x']+=dx;prop['y']+=dy;prop['blocks']=[[cx+dx//24,cy+dy//24] for cx,cy in prop.get('blocks',[])];blocks.update(tuple(q) for q in prop['blocks'])
a['blocks']=sorted(blocks);d['size']=[W,H];d['terrainTiles']=tiles;d['terrainGrid']={'cellSize':64,'cols':cols,'rows':rows,'textures':[4,5,6],'nativeCornerBits':'TL8 TR4 BL2 BR1','roadsBaked':True};d['navigationBounds']={'left':96,'top':64,'right':W-96,'bottom':1952}
cells=[]
for y in range(H//16):
 for x in range(W//16):
  box=(x*16,y*16,x*16+16,y*16+16);landval=ImageStat.Stat(landmask.crop(box)).mean[0];roadval=ImageStat.Stat(roadmask.crop(box)).mean[0];cells.append(0 if landval<160 else 2 if roadval>=128 else 1)
d['buildTerrain'].update(cols=W//16,rows=H//16,cells=cells,classification='native terrain alpha: visible land mean >=160, road alpha mean >=128; fixed rock collisions remain')
write(R/'shared/level-data.js',d,'ZergLevel');write(R/'shared/art-data.js',a,'ZergArt')
b=bytearray(struct.pack('<4h4i',0x66,1,cols,rows,0,0,0,0))
for i,ls in enumerate(tiles):
 b.extend(struct.pack('<hhB',i%cols,i//cols,len(ls)))
 for tid,alpha in ls:b.extend(struct.pack('BB',tid,alpha))
(R/'source-map/strategic-expanded.ter').write_bytes(b)
print('Terrain',W,H,'tiles',len(tiles),'bytes',(R/'assets/terrain.png').stat().st_size,'buildable',cells.count(1))
