"""Pack original unmanned mechanical bodies independently from branch operators."""
from pathlib import Path
import json,re,plistlib,subprocess
from PIL import Image
R=Path(__file__).resolve().parents[1]
exec((R/'tools/extract-source.py').read_text().split('M=R/')[0])
p=R/'shared/art-data.js';s=p.read_text();a=json.loads(subprocess.check_output([str(R.parents[1]/'work/gear-render/node-v22.14.0-darwin-arm64/bin/node'),'-e','process.stdout.write(JSON.stringify(require(process.argv[1])))',str(p)]));page='basic-towers-native.png'
if page not in a['pages']:a['pages'].append(page)
items=[];units={};src=clean((S/'tabs/tab_unit.lua').read_text());nums=lambda s:list(map(int,re.findall(r'-?\d+',s)))
models=(S/'tabs/model/tab_model_unit.lua').read_text()
import zlib,struct,shutil
helper=(R/'tools/import-tactics.py').read_text();exec(helper[helper.index('def texture('):helper.index('for id,e in effects.items():')])
def unit(uid):
 m=list(re.finditer(r'_tab_unit\['+str(uid)+r'\]\s*=',src))[-1]
 return native(lua.eval(table(src,m.end())))
for key in list(a['frames']):
 if key.startswith('basic/'):del a['frames'][key]
for key in list(a['groups']):
 if key.startswith('basic/'):del a['groups'][key]
for uid,bullet_uid in [(7010,6013),(7017,6002),(7020,6008),(7019,6017)]:
 u=unit(uid);u['model']+='_A';role='basic/'+str(uid);group={'dirs':32,'anim':{},'intervals':{'stand':.12,'attack':.12}}
 units[str(uid)]={'role':role,'renderScale':u['scale']*2,'bullet':unit(bullet_uid)['bullet'],'sourceUnit':uid,'model':u['model'],'baseOffsetY':-8 if uid==7010 else 0}
 model=re.search(r'HMDx32P2PIC\("'+re.escape(u['model'])+r'","([^"]+)"',models).group(1)
 file=S/'image'/model;frames=plistlib.load(file.open('rb'))['frames'];tex=texture(file)
 for key,f in sorted(frames.items()):
  action=key.split('/')[-2]
  if action not in ('stand','attack'):continue
  row=int(Path(key).stem)//10000;x,y,w,h=nums(f.get('frame',f.get('textureRect')));rot=f.get('rotated',f.get('textureRotated',False));im=tex.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
  if rot:im=im.transpose(Image.Transpose.ROTATE_90)
  sw,sh=nums(f.get('sourceSize',f.get('spriteSourceSize')));cx,cy=nums(f['sourceColorRect'])[:2] if 'sourceColorRect' in f else ((sw-w)/2+nums(f['spriteOffset'])[0],(sh-h)/2-nums(f['spriteOffset'])[1])
  im=im.resize((max(1,round(w/2)),max(1,round(h/2))),Image.Resampling.LANCZOS);k=role+'/'+action+'/'+Path(key).stem;items.append((k,im,(cx-sw*.5)/2,(cy-sh*.45)/2));group['anim'].setdefault(action,{}).setdefault(str(row),[]).append(k)
 a['groups'][role]=group
# Reuse identical stand/attack cells. Palette compression is atlas packaging only.
out=Image.new('RGBA',(2048,2048));x=y=rh=0;cache={}
for key,im,ox,oy in sorted(items,key=lambda item:-item[1].height):
 sig=(im.size,im.tobytes())
 if sig in cache:xx,yy=cache[sig]
 else:
  if x+im.width>2048:x=0;y+=rh+1;rh=0
  if y+im.height>2048:raise RuntimeError('atlas overflow')
  xx,yy=x,y;out.paste(im,(x,y));cache[sig]=(x,y);x+=im.width+1;rh=max(rh,im.height)
 a['frames'][key]={'page':a['pages'].index(page),'x':xx,'y':yy,'w':im.width,'h':im.height,'ox':ox,'oy':oy}
out.crop((0,0,2048,y+rh)).quantize(colors=128,method=Image.Quantize.FASTOCTREE).save(R/'assets'/page,optimize=True)
a['basicTowerUnits']=units
p.write_text('(function(){const d='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();')
print('Native unmanned bodies:',len(items),'frames;', (R/'assets'/page).stat().st_size,'bytes')

# The isolated wolf campaign has its own atlas page numbering.
W=R.parent/'alien-wolf-wechat';wp=W/'shared/art-data.js';ws=wp.read_text();wa=json.loads(subprocess.check_output([str(R.parents[1]/'work/gear-render/node-v22.14.0-darwin-arm64/bin/node'),'-e','process.stdout.write(JSON.stringify(require(process.argv[1])))',str(wp)]))
if page not in wa['pages']:wa['pages'].append(page)
for k in list(wa['frames']):
 if k.startswith('basic/'):del wa['frames'][k]
for k in list(wa['groups']):
 if k.startswith('basic/'):del wa['groups'][k]
for k,v in a['frames'].items():
 if k.startswith('basic/'):wa['frames'][k]={**v,'page':wa['pages'].index(page)}
wa['groups'].update({k:v for k,v in a['groups'].items() if k.startswith('basic/')});wa['basicTowerUnits']=units
wp.write_text('(function(){const d='+json.dumps(wa,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();')
shutil.copy2(R/'assets'/page,W/'assets'/page)
