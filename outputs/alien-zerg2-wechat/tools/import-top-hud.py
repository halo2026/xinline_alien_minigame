from pathlib import Path
import json,plistlib,re
from PIL import Image
r=Path(__file__).resolve().parents[1];src=r.parent/'alien-mac/source/XLFramework/Projects/alien_source/data/image';p=r/'shared/art-data.js';s=p.read_text();a=json.loads(s[s.index('=',s.index('const '))+1:s.index(';if(typeof module')]);prov=json.loads((r/'art-provenance.json').read_text());out=Image.new('RGBA',(160,80));x=0
for name,file in [('hud-wave','misc/wave_icon.png'),('hud-kills','ui/icon_killcount.png')]:
 f=src/file
 if f.exists():im=Image.open(f).convert('RGBA')
 else:
  meta=plistlib.load((src/'ui.plist').open('rb'))['frames']['data/image/'+file];nums=lambda t:list(map(int,re.findall(r'-?\d+',t)));xx,yy,w,h=nums(meta['frame']);rot=meta.get('rotated',False);im=Image.open(src/'ui.png').crop((xx,yy,xx+(h if rot else w),yy+(w if rot else h)))
  if rot:im=im.transpose(Image.Transpose.ROTATE_90)
  full=Image.new('RGBA',tuple(nums(meta['sourceSize'])));full.paste(im,tuple(nums(meta['sourceColorRect'])[:2]));im=full
 page='top-hud-native.png'
 if page not in a['pages']:a['pages'].append(page)
 out.paste(im,(x,0));a['frames'][name]={'x':x,'y':0,'w':im.width,'h':im.height,'ox':-im.width/2,'oy':-im.height/2,'page':a['pages'].index(page)};x+=im.width+2
 prov=[v for v in prov if v['frame']!=name];prov.append({'frame':name,'source':'image/'+file})
out.save(r/'assets'/page);p.write_text('(function(){const d='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();');(r/'art-provenance.json').write_text(json.dumps(prov,ensure_ascii=False,indent=2))
