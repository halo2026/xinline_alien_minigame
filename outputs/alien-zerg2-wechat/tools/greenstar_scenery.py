"""Alien native mineral ridges and readable authored lanes; no stretched scenery."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter,ImageEnhance,ImageChops
import math,random
ALIEN=Path('outputs/alien-mac/source/XLFramework/Projects/alien_source/data')
MINERALS=['mine_stone01','mine_stone02','mine_stone03','mine_stone04','mine_crystal01','mine_crystal02','mine_crystal03','crystal','crystal2','crystal3']
def distance(x,y,segments):
 result=1e9
 for a,b in segments:
  dx,dy=b[0]-a[0],b[1]-a[1];t=max(0,min(1,((x-a[0])*dx+(y-a[1])*dy)/max(1,dx*dx+dy*dy)))
  result=min(result,math.hypot(x-a[0]-t*dx,y-a[1]-t*dy))
 return result

def routes(settings,points):
 return [[(points[i]['x'],points[i]['y'])for i in route]for route in settings['pathList']]

def tile(name,size):
 q=Image.open(ALIEN/name).convert('RGB');q=q.crop((256,0,512,256)) if q.size==(512,256) else q;out=Image.new('RGB',size)
 for y in range(0,size[1],q.height):
  for x in range(0,size[0],q.width):out.paste(q,(x,y))
 return out

def road_mask(size,paths):
 # Original route geometry, now a broad pale mineral-gravel lane with dark shoulders.
 mask=Image.new('L',size);draw=ImageDraw.Draw(mask)
 for path in paths:
  draw.line(path,fill=255,width=96,joint='curve')
  for x,y in path:draw.ellipse((x-48,y-48,x+48,y+48),fill=255)
 return mask.filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.MinFilter(41)).filter(ImageFilter.GaussianBlur(8)).point(lambda a:255 if a>=110 else 0)

def terrain(ground,paths):
 mask=road_mask(ground.size,paths)
 outer=mask.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(7))
 base=ImageEnhance.Color(ground.convert('RGB')).enhance(.38)
 base=Image.blend(base,ImageEnhance.Color(tile('terrain/t_05.png',base.size)).enhance(.38),.7)
 base=ImageChops.multiply(base,Image.new('RGB',base.size,(156,176,188)))
 shoulder=ImageEnhance.Brightness(tile('terrain/t_05.png',base.size)).enhance(.7)
 base.paste(shoulder,(0,0),outer)
 # Use Alien's native dry mineral surface, not a flat painted navigation stripe.
 gravel=tile('terrain/t_15.png',base.size)
 # t_15 includes transition cells in its left half; tile the fully opaque quadrant.
 tex=Image.open(ALIEN/'terrain/t_15.png').convert('RGB');tex=tex.crop((256,0,512,256))if tex.width==512 else tex
 for y in range(0,base.height,tex.height):
  for x in range(0,base.width,tex.width):gravel.paste(tex,(x,y))
 gravel=ImageEnhance.Color(gravel).enhance(.4);gravel=ImageEnhance.Brightness(gravel).enhance(.84)
 base.paste(gravel,(0,0),mask.filter(ImageFilter.GaussianBlur(5)))
 return base

def add_frames(frames,items):
 q=Image.open(ALIEN/'terrain/t_05.png').convert('RGB').crop((256,0,512,256))
 q=ImageEnhance.Color(q).enhance(.38);q=ImageChops.multiply(q,Image.new('RGB',q.size,(156,176,188))).convert('RGBA')
 frames['greenstar-border-ground']=dict(w=256,h=256,ox=0,oy=0);items.append(('greenstar-border-ground',q))
 for name in MINERALS:
  q=Image.open(ALIEN/'xlobj'/f'{name}.png').convert('RGBA');sw,sh=q.size
  # Native aspect ratio and a maximum 185 world-unit height for individual rocks.
  scale=min(1,185/sh);ow,oh=sw*scale,sh*scale
  key='greenstar-mine/'+name;frames[key]=dict(w=sw,h=sh,ow=ow,oh=oh,ox=-ow/2,oy=-oh*.72);items.append((key,q))

def bank(q):
 # Keep exact authored bank cutout, replace its earth/grass with native Zerg tissue.
 source=Image.open(ALIEN/'xlobj/creep_01.png').convert('RGBA');cw,ch=source.size;source=source.crop((cw//4,ch//4,cw*3//4,ch*3//4));tex=Image.new('RGB',q.size,(53,34,55))
 for y in range(0,q.height,source.height):
  for x in range(0,q.width,source.width):tex.paste(source,(x,y),source)
 tex=ImageEnhance.Color(tex).enhance(1.18)
 tex=ImageEnhance.Brightness(tex).enhance(.86).convert('RGBA');tex.putalpha(q.getchannel('A'))
 # Organic vein sprite breaks up the repeated tissue without a geometric border.
 vein=Image.open(ALIEN/'xlobj/creep_net.png').convert('RGBA');layer=Image.new('RGBA',q.size)
 for y in range(15,q.height,103):
  for x in range((y//103%2)*53,q.width,137):layer.alpha_composite(vein,(x,y))
 layer.putalpha(ImageChops.multiply(layer.getchannel('A'),q.getchannel('A')).point(lambda a:round(a*.28)));tex.alpha_composite(layer)
 return tex

def cluster(u,model,q,ox,oy,paths,objectives):
 segments=[(a,b)for path in paths for a,b in zip(path,path[1:])];rng=random.Random(str(u));mountain=model.startswith('mountain');wood=model.startswith('xwj_');rock=model.startswith(('rock','gres'))
 if not(mountain or wood or rock or model.startswith('plant')):return []
 step=64 if mountain else 62;result=[];mask=q.getchannel('A')
 # Occupy the original mountain/woodland silhouette with multiple normal-scale native minerals.
 for iy in range(18,q.height,step):
  for ix in range(18,q.width,step):
   if mask.getpixel((ix,iy))<180:continue
   x=u[3]+(-ox-q.width+ix if u[5]==180 else ox+ix);y=u[4]+oy+iy
   if distance(x,y,segments)<83:continue
   if any(math.hypot(x-v['x'],y-v['y'])<105 for v in objectives):continue
   if not mountain and rng.random()<.32:continue
   name=MINERALS[rng.randrange(4) if mountain or rock else rng.randrange(10)]
   radius=36 if name in ['mine_stone01','mine_stone02','mine_stone04'] else 25
   result.append(dict(frame='greenstar-mine/'+name,x=round(x,2),y=round(y,2),w=radius*2,h=radius*2,flip=rng.random()<.5,blocks=[],groundRadius=radius,zOrder=0,model=name,sourceModel=model,sourcePlacement=f'{u[1]}:{u[3]}:{u[4]}'))
 return result

def unify_river(props,frames,items,size):
 """Compose one river silhouette before drawing its bank, avoiding rectangular tile seams."""
 images=dict(items);water=Image.new('L',size)
 for prop in props:
  if not prop.get('river'):continue
  key=prop['frame'];q=images[key];f=frames[key];a=q.getchannel('A');shore=images.get(key+'/shore')
  if shore:
   sf=frames[key+'/shore'];sm=Image.new('L',q.size);sm.paste(shore.getchannel('A'),(round(sf['ox']-f['ox']),round(sf['oy']-f['oy'])));a=ImageChops.subtract(a,sm)
  ox=f['ox']
  if prop['flip']:a=a.transpose(Image.Transpose.FLIP_LEFT_RIGHT);ox=-ox-q.width
  layer=Image.new('L',size);layer.paste(a,(round(prop['x']+ox),round(prop['y']+f['oy'])));water=ImageChops.lighter(water,layer)
 water=water.point(lambda x:255 if x>100 else 0).filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.MinFilter(13))
 outer=water.filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.GaussianBlur(2))
 inner=water.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1))
 rim=ImageChops.subtract(outer,inner)
 bbox=outer.getbbox();x,y,right,bottom=bbox;alpha=outer.crop(bbox);rim=rim.crop(bbox)
 base=tile('terrain/t_11.png',(right-x,bottom-y)).convert('RGBA');base.putalpha(alpha)
 tissue=bank(Image.merge('RGBA',(rim,rim,rim,rim)))
 name='greenstar-river/unified';sw,sh=base.size
 for key,im in [(name,base),(name+'/shore',tissue)]:frames[key]=dict(w=sw,h=sh,ox=-sw/2,oy=-sh/2);items.append((key,im))
 old={p['frame']for p in props if p.get('river')}
 items[:]=[(key,im)for key,im in items if key not in old and key.removesuffix('/shore')not in old]
 for key in list(frames):
  if key in old or key.removesuffix('/shore')in old:del frames[key]
 retained=[p for p in props if not p.get('river')];cells=[cell for p in props if p.get('river')for cell in p['blocks']]
 retained.append(dict(frame=name,x=(x+right)/2,y=(y+bottom)/2,w=sw,h=sh,flip=False,blocks=cells,zOrder=-4000,river=True,model='river-unified'))
 return retained
