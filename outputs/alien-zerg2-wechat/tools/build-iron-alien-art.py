"""Extract native single-facing duel animations; no generated character imagery."""
from pathlib import Path
import plistlib,re,json
from PIL import Image
R=Path(__file__).resolve().parents[1];src=Path('/Users/wangxin/Documents/projects/source/data/image/unit');frames={};groups={};tiles=[]
for name,key,flip in [('alien_queen','duel-queen',True),('tiexuezhanshi','duel-predator',False)]:
 world=plistlib.load((src/f'{name}_world.plist').open('rb'))['frames'];baseline=max(sum(list(map(int,re.findall(r'-?\d+',f['sourceColorRect'])))[1::2]) for k,f in world.items() if '/stand/2' in k)
 anim={}
 for action in (['stand','attack','skill','walk'] if key=='duel-predator' else ['stand','attack','skill']):
  part='world' if action in ['stand','walk'] else 'battle';meta=plistlib.load((src/f'{name}_{part}.plist').open('rb'))['frames'];sheet=Image.open(src/f'{name}_{part}.png').convert('RGBA');rows=[]
  for k,f in sorted(meta.items()):
   if f'/{action}/2' not in k:continue
   x,y,w,h=map(int,re.findall(r'-?\d+',f['frame']));tile=sheet.crop((x,y,x+(h if f['rotated'] else w),y+(w if f['rotated'] else h)))
   if f['rotated']:tile=tile.transpose(Image.Transpose.ROTATE_90)
   rx,ry,rw,rh=map(int,re.findall(r'-?\d+',f['sourceColorRect']));sw,sh=map(int,re.findall(r'-?\d+',f['sourceSize']));ox=rx-sw/2;oy=ry-baseline
   # Anchor the feet at the world ground plane, and bake the left-facing queen once.
   if flip or action=='walk':tile=tile.transpose(Image.Transpose.FLIP_LEFT_RIGHT);ox=-ox-w
   frame=f'{key}/{action}/{len(rows)}';rows.append(frame);tiles.append((frame,tile,ox,oy))
  anim[action]={'1':rows}
 groups[key]={'anim':anim,'intervals':{'stand':.12,'attack':.12,'skill':.12},'directions':1}
x=y=rowh=0;placements=[]
for key,im,ox,oy in tiles:
 if x+im.width>1024:x=0;y+=rowh+2;rowh=0
 placements.append((key,im,x,y,ox,oy));x+=im.width+2;rowh=max(rowh,im.height)
atlas=Image.new('RGBA',(1024,y+rowh))
for key,im,x,y,ox,oy in placements:
 atlas.alpha_composite(im,(x,y));frames[key]={'page':0,'x':x,'y':y,'w':im.width,'h':im.height,'ox':ox,'oy':oy}
 if key.startswith('duel-predator/'):
  pixels=im.load();ys=[py for py in range(im.height) for px in range(im.width) if pixels[px,py][3]>180];bottom=max(ys);xs=[px for py in range(max(0,bottom-10),bottom+1) for px in range(im.width) if pixels[px,py][3]>180];frames[key].update(footX=ox+sum(xs)/len(xs),footY=oy+bottom-2)
atlas.quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets/iron-alien-duel.png',optimize=True)
data={'pages':['iron-alien-duel.png'],'frames':frames,'groups':groups};(R/'shared/iron-alien-art.js').write_text('(function(){const a='+json.dumps(data,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=a;else globalThis.IronAlienArt=a;})();\n')
print(atlas.size,(R/'assets/iron-alien-duel.png').stat().st_size)
