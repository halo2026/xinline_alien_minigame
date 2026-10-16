"""Extract original 3060/3110 impact and 3139 dust, preserving native trimmed cells."""
from pathlib import Path
import json,re,plistlib
from PIL import Image
R=Path(__file__).resolve().parents[1];S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data'
p=R/'shared/art-data.js';s=p.read_text();a=json.loads(s[s.index('const data=')+11:s.index(';if(typeof module')]);items=[]
nums=lambda s:list(map(int,re.findall(r'-?\d+',s)))
for kind,file,anchor in [('impact','pojiadanbaozha',(.4,.5)),('dust','dust2',(.5,.5))]:
 sheet=Image.open(S/f'image/effect/{file}.png').convert('RGBA');frames=plistlib.load((S/f'image/effect/{file}.plist').open('rb'))['frames'];names=[]
 for key,f in sorted(frames.items()):
  x,y,w,h=nums(f['frame']);rot=f.get('rotated',False);im=sheet.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
  if rot:im=im.transpose(Image.Transpose.ROTATE_90)
  sw,sh=nums(f['sourceSize']);cx,cy=nums(f['sourceColorRect'])[:2];name=f'pincerfx/{kind}/{len(names)}';names.append(name);items.append((name,im,{'ox':cx-sw*anchor[0],'oy':cy-sh*anchor[1]}))
 a['groups'][f'pincerfx/{kind}']=names
sheet=Image.open(S/'image/effect/burst_2.png').convert('RGBA');names=[]
for i in range(6):
 name=f'pincerfx/burst/{i}';names.append(name);items.append((name,sheet.crop((i*64,0,(i+1)*64,64)),{'ox':-32,'oy':-32}))
a['groups']['pincerfx/burst']=names
page='pincer-native.png'
if page not in a['pages']:a['pages'].append(page)
out=Image.new('RGBA',(1024,1024));x=y=rh=0
for name,im,meta in items:
 if x+im.width>1024:x=0;y+=rh+2;rh=0
 assert y+im.height<=1024
 out.paste(im,(x,y));a['frames'][name]={**meta,'x':x,'y':y,'w':im.width,'h':im.height,'page':a['pages'].index(page)};x+=im.width+2;rh=max(rh,im.height)
out.crop((0,0,1024,y+rh)).save(R/'assets'/page,optimize=True)
p.write_text('(function(){const data='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.ZergArt=data;})();')
print(len(items),'original frames,', (R/'assets'/page).stat().st_size,'bytes')

provenance=R/'art-provenance.json'
records=json.loads(provenance.read_text());records=[r for r in records if not r.get('frame','').startswith('pincerfx/')]
for name,im,meta in items:
 kind=name.split('/')[1];source={'impact':'pojiadanbaozha.plist','dust':'dust2.plist','burst':'burst_2.png'}[kind]
 records.append({'frame':name,'source':'image/effect/'+source})
provenance.write_text(json.dumps(records,ensure_ascii=False,indent=2))
