from pathlib import Path
import json
from PIL import Image
r=Path(__file__).resolve().parents[1]
p=r/'shared/art-data.js';s=p.read_text();a=json.loads(s[s.index('=',s.index('const '))+1:s.index(';if(typeof module')])
page='challenge-ui-generated.png'
if page not in a['pages']:a['pages'].append(page)
out=Image.new('RGBA',(384,96))
keys=['random-red-equipment','hud-wave-1','hud-wave-2','hud-wave-3']
prov=json.loads((r/'art-provenance.json').read_text())
for i,key in enumerate(keys):
 source=r/'artwork/challenge-ui-0074'/(key+'.png')
 im=Image.open(source).convert('RGBA');im.thumbnail((96,96),Image.Resampling.LANCZOS)
 x=i*96+(96-im.width)//2;y=(96-im.height)//2;out.paste(im,(x,y))
 a['frames'][key]={'x':i*96,'y':0,'w':96,'h':96,'ox':-48,'oy':-48,'page':a['pages'].index(page)}
 prov=[v for v in prov if v['frame']!=key];prov.append({'frame':key,'source':'artwork/challenge-ui-0074/'+key+'.png','generator':'built-in imagegen; wave variants based on original misc/wave_icon.png'})
out.save(r/'assets'/page)
p.write_text('(function(){const data='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.ZergArt=data;})();')
(r/'art-provenance.json').write_text(json.dumps(prov,ensure_ascii=False,indent=2))
