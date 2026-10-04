from pathlib import Path
import json,shutil,plistlib,re
from PIL import Image
r=Path(__file__).resolve().parents[1];source=r.parent/'alien-mac/source/XLFramework/Projects/alien_source/data/image/ui/image_update.png';p=r/'shared/art-data.js';s=p.read_text();a=json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')]);name='tower-upgrade-arrow.png';atlas=source.parent.parent/'ui.png';meta=plistlib.load(atlas.with_suffix('.plist').open('rb'))['frames']['data/image/ui/image_update.png'];nums=lambda text:list(map(int,re.findall(r'-?\d+',text)));x,y,w,h=nums(meta['frame']);im=Image.open(atlas).crop((x,y,x+h,y+w)).transpose(Image.Transpose.ROTATE_90);full=Image.new('RGBA',(38,38));full.paste(im,tuple(nums(meta['sourceColorRect'])[:2]));full.save(r/'assets'/name)
if name not in a['pages']:a['pages'].append(name)
a['frames']['tower-upgrade-arrow']={'w':38,'h':38,'ox':-19,'oy':-19,'x':0,'y':0,'page':a['pages'].index(name)}
p.write_text('(function(){const d='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();')
p=r/'art-provenance.json';v=json.loads(p.read_text());v=[i for i in v if i['frame']!='tower-upgrade-arrow'];v.append({'frame':'tower-upgrade-arrow','source':'image/ui/image_update.png','model':'ICON:image_update normal 38x38'});p.write_text(json.dumps(v,ensure_ascii=False,indent=2))
