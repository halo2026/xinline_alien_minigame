"""Native zerg IV unit 12200, model 671; use separate runtime ID to avoid tower 12200."""
from pathlib import Path
from PIL import Image
import plistlib,re,json,hashlib
R=Path(__file__).resolve().parents[1];S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data'
nums=lambda s:list(map(int,re.findall(r'-?\d+',s)))

for old in (R/'assets').glob('zerg4-boss-*.png'):old.unlink()
frames={};items=[];group={'dirs':4,'anim':{},'intervals':{'stand':.12,'walk':.14,'attack':.14,'skill':.2,'dead':.25}}
for suffix in ['world','battle']:
 p=S/'image/unit'/('zhangyuguai_'+suffix+'.plist');sheet=Image.open(p.with_suffix('.png')).convert('RGBA')
 for key,f in sorted(plistlib.load(p.open('rb'))['frames'].items()):
  action=key.split('/')[-2];num=int(Path(key).stem);row=num//10000
  if row!=2:continue # Encounter faces left along its route and toward the refinery.
  x,y,w,h=nums(f['frame']);rot=f.get('rotated',False);im=sheet.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
  if rot:im=im.transpose(Image.Transpose.ROTATE_90)
  sw,sh=nums(f['sourceSize']);cx,cy=nums(f['sourceColorRect'])[:2];name='zerg4/'+action+'/'+str(num)
  im=im.resize((round(w*.5),round(h*.5)),Image.Resampling.LANCZOS);frames[name]={'w':im.width,'h':im.height,'ow':w*.5,'oh':h*.5,'ox':(cx-sw*.5)*.5,'oy':(cy-sh*.5)*.5};items.append((name,im));group['anim'].setdefault(action,{}).setdefault(str(row),[]).append(name)
# Native art at native 300/600 world scale with original world footprint and complete left-facing animation cycles.
seen={};aliases={}
unique=[]
for name,im in items:
 key=(im.size,hashlib.sha256(im.tobytes()).digest())
 if key in seen:aliases[name]=seen[key]
 else:seen[key]=name;unique.append((name,im))
items=unique
pages=[];atlas=Image.new('RGBA',(1024,1024));x=y=rh=0
def save():
 name='zerg4-boss-'+str(len(pages))+'.png';atlas.crop((0,0,1024,y+rh)).quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets'/name,optimize=True);pages.append(name)
for name,im in items:
 if x+im.width>1024:x=0;y+=rh;rh=0
 if y+im.height>1024:save();atlas=Image.new('RGBA',(1024,1024));x=y=rh=0
 frames[name].update(page=len(pages),x=x,y=y);atlas.alpha_composite(im,(x,y));x+=im.width+2;rh=max(rh,im.height+2)
save()
for name,original in aliases.items():
 for key in ['page','x','y']:frames[name][key]=frames[original][key]
(R/'shared/zerg4-boss-art.js').write_text('(function(){const d='+json.dumps({'pages':pages,'frames':frames,'group':group},separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.Zerg4BossArt=d;})();')
print(len(items),'native frames',sum((R/'assets'/p).stat().st_size for p in pages),'bytes')
