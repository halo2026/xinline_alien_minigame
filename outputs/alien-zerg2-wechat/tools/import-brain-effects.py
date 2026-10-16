"""Original effects: 3246 spiral and 663 two-frame landing warning; other effects already packed."""
from pathlib import Path
import json
from PIL import Image
R=Path(__file__).resolve().parents[1];S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data/image/effect'
p=R/'shared/art-data.js';s=p.read_text();a=json.JSONDecoder().raw_decode(s[s.index('const data=')+11:])[0];page='brain-native.png'
if page not in a['pages']:a['pages'].append(page)
atlas=Image.new('RGBA',(192,64));records=[]
for name,file,indices in [('spiral','luoxuan.png',[0]),('warning','warning.png',[0,1])]:
 im=Image.open(S/file).convert('RGBA');frames=[]
 for i in indices:
  x=len(records)*64;key=f'brainfx/{name}/{i}';atlas.paste(im.crop((i*64,0,i*64+64,64)),(x,0));a['frames'][key]={'x':x,'y':0,'w':64,'h':64,'ox':-32,'oy':-32,'page':a['pages'].index(page)};frames.append(key);records.append({'frame':key,'source':'image/effect/'+file})
 a['groups']['brainfx/'+name]=frames
atlas.save(R/'assets'/page,optimize=True);p.write_text('(function(){const data='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.ZergArt=data;})();')
p=R/'art-provenance.json';p.write_text(json.dumps([r for r in json.loads(p.read_text()) if not r.get('frame','').startswith('brainfx/')]+records,ensure_ascii=False,indent=2))
print('native brain effects:',(R/'assets'/page).stat().st_size)
