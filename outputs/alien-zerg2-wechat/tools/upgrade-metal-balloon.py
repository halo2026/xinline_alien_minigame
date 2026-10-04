"""Restore native steel-balloon pixels, deduplicate identical atlas crops, preserve world anchors."""
from pathlib import Path
import json,re,plistlib,hashlib
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parents[1]
S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data/image/unit'
def read(p):
 s=p.read_text();return json.loads(s[s.index('=',s.index('const '))+1:s.index(';if(')])
def write(p,d,var,glob):p.write_text('(function(){const '+var+'='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports='+var+';else globalThis.'+glob+'='+var+';})();\n')
a=read(R/'shared/defense-art.js');native={};nums=lambda s:list(map(int,re.findall(r'-?\d+',s)))
for p in sorted(S.glob('metal_balloon2_*.plist')):
 im=Image.open(p.with_suffix('.png')).convert('RGBA')
 for key,f in plistlib.load(p.open('rb'))['frames'].items():
  action=key.split('/')[-2];number=int(re.search(r'(\d+)\.png$',key)[1]);name=f'campaign-unit/metal_balloon2/{action}/{number//10000}/{number%10000}'
  x,y,w,h=nums(f['frame']);rot=f.get('rotated',False);crop=im.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
  if rot:crop=crop.transpose(Image.Transpose.ROTATE_90)
  native[name]=crop
filename='metal-balloon-native.png';page=a['pages'].index(filename) if filename in a['pages'] else len(a['pages'])
if filename not in a['pages']:a['pages'].append(filename)
unique={};regions={};old={};images={}
for name,f in a['frames'].items():
 if name not in native:continue
 old[name]=dict(f);im=native[name];digest=hashlib.sha256(str(im.size).encode()+im.tobytes()).hexdigest();unique.setdefault(digest,im);images[name]=digest
atlas=Image.new('RGBA',(1024,1024));x=y=row=0
for digest,im in unique.items():
 if x+im.width+2>1024:x=0;y+=row;row=0
 assert y+im.height<=1024
 atlas.paste(im,(x,y));regions[digest]=(x,y,im.width,im.height);x+=im.width+2;row=max(row,im.height+2)
atlas=atlas.crop((0,0,1024,y+row));atlas.quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets'/filename,optimize=True)
remap={}
for name,digest in images.items():
 f=a['frames'][name];o=old[name];x,y,w,h=regions[digest];remap[(a['pages'][o['page']],o['x'],o['y'],o['w'],o['h'])]=(x,y,w,h);f.update(page=page,x=x,y=y,w=w,h=h)
write(R/'shared/defense-art.js',a,'data','DefenseArt')
# Reuse the same high-resolution crops in both archive tiers, retaining gameplay size.
b=read(R/'shared/bestiary-data.js');bp=b['pages'].index(filename) if filename in b['pages'] else len(b['pages'])
if filename not in b['pages']:b['pages'].append(filename)
for e in b['entries']:
 if e['family']!='METAL_BALLOON2':continue
 for rows in e['frames'].values():
  for frame in rows:
   target=remap.get((b['pages'][frame[0]],*frame[1:]));
   if target:frame[:]=[bp,*target]
 e['previewSize']=[max(f[3] for rows in e['frames'].values() for f in rows),max(f[4] for rows in e['frames'].values() for f in rows)]
for root in [R,R.parent/'alien-wolf-wechat']:write(root/'shared/bestiary-data.js',b,'d','BestiaryData')
print('Restored',len(images),'frames;',len(unique),'unique crops;',atlas.size,'atlas;', (R/'assets'/filename).stat().st_size,'bytes')
