"""Restore UNIT_BRAIN sprites from native PNGs without resampling or quantization."""
from pathlib import Path
import re,json,plistlib
from PIL import Image
R=Path(__file__).resolve().parents[1]
S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data/image/unit'
def read(p):
 s=p.read_text();start=s.index('const data=')+11 if 'const data=' in s else s.index('const d=')+8
 d,end=json.JSONDecoder().raw_decode(s[start:]);return s,start,end,d
p=R/'shared/defense-art.js';_,_,_,old=read(p)
items={}
nums=lambda s:list(map(int,re.findall(r'-?\d+',s)))
for stem in ['brain_world','brain_battle']:
 meta=plistlib.load((S/(stem+'.plist')).open('rb'));sheet=Image.open(S/(stem+'.png')).convert('RGBA')
 for key,f in sorted(meta['frames'].items()):
  action=key.split('/')[-2];n=int(Path(key).stem);name=f'campaign-unit/brain/{action}/{n//10000}/{n%10000}'
  if name not in old['frames'] or name in items:continue
  x,y,w,h=nums(f['frame']);rot=f.get('rotated',False);im=sheet.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
  if rot:im=im.transpose(Image.Transpose.ROTATE_90)
  assert im.size==(old['frames'][name]['ow'],old['frames'][name]['oh'])
  items[name]=im
assert len(items)==len([k for k in old['frames'] if k.startswith('campaign-unit/brain/')])
pages=[];new={};atlas=Image.new('RGBA',(1024,1024));x=y=rowh=0

def save():
 file=f'brain-native-{len(pages)}.png';atlas.crop((0,0,1024,y+rowh)).save(R/'assets'/file,optimize=True);pages.append(file)
for name,im in items.items():
 if x+im.width>1024:x=0;y+=rowh;rowh=0
 if y+im.height>1024:save();atlas=Image.new('RGBA',(1024,1024));x=y=rowh=0
 atlas.paste(im,(x,y));new[name]={**old['frames'][name],'x':x,'y':y,'w':im.width,'h':im.height,'page':len(pages)}
 x+=im.width+2;rowh=max(rowh,im.height+2)
save()
for name,f in new.items():
 with Image.open(R/'assets'/pages[f['page']]) as page:
  assert page.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h'])).tobytes()==items[name].tobytes()
# Remap the old archive coordinates by frame identity before updating art.
lookup={(old['pages'][f['page']],f['x'],f['y'],f['w'],f['h']):name for name,f in old['frames'].items() if name in new}
for root in [R,R.parent/'alien-wolf-wechat']:
 bp=root/'shared/bestiary-data.js';s,start,end,b=read(bp)
 for file in pages:
  if file not in b['pages']:b['pages'].append(file)
 for e in b['entries']:
  if e['family']!='UNIT_BRAIN':continue
  for action,fs in e['frames'].items():
   for i,f in enumerate(fs):
    name=lookup[(b['pages'][f[0]],*f[1:])];nf=new[name];fs[i]=[b['pages'].index(pages[nf['page']]),nf['x'],nf['y'],nf['w'],nf['h']]
  e['previewSize']=[max(f[j] for fs in e['frames'].values() for f in fs) for j in [3,4]]
 bp.write_text(s[:start]+json.dumps(b,separators=(',',':'),ensure_ascii=False)+s[start+end:])
 if root!=R:
  import shutil
  for file in pages:shutil.copy2(R/'assets'/file,root/'assets'/file)
for file in ['defense-art.js','art-data.js']:
 p=R/'shared'/file;s,start,end,a=read(p)
 for page in pages:
  if page not in a['pages']:a['pages'].append(page)
 for name,f in new.items():a['frames'][name]={**f,'page':a['pages'].index(pages[f['page']])}
 p.write_text(s[:start]+json.dumps(a,separators=(',',':'))+s[start+end:])
print(json.dumps({'frames':len(new),'pages':pages,'bytes':sum((R/'assets'/f).stat().st_size for f in pages),'pixelEquality':'all native cropped RGBA bytes equal','worldSize':'ow/oh/ox/oy unchanged'}))
