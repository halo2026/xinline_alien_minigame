"""Import the 2026-10-13 mailed base Jeep, preserving pixels, pivot and 32-way mirroring."""
from pathlib import Path
import json,hashlib
from PIL import Image
R=Path(__file__).resolve().parents[1];S=R/'source-art/jeep-base-20261013';p=R/'shared/art-data.js'
s=p.read_text();a=json.JSONDecoder().raw_decode(s[s.index('const data=')+11:])[0]
page='jeep-base-20261013.png'
if page not in a['pages']:a['pages'].append(page)
atlas=Image.new('RGBA',(1024,1024));x=y=rh=0;rows={};manifest=[]
for direction in range(1,18):
 source=S/f'a{direction:02}000.png';image=Image.open(source).convert('RGBA');assert image.size==(256,256)
 box=image.getbbox();tile=image.crop(box)
 if x+tile.width+2>1024:x=0;y+=rh+2;rh=0
 assert y+tile.height<=1024
 atlas.paste(tile,(x,y));name=f'car-base-20261013/{direction}';rows[str(direction)]=[name]
 # Same full-canvas pivot as the original jeep3: (.5, .45). Headlights do not recenter the body.
 a['frames'][name]={'x':x,'y':y,'w':tile.width,'h':tile.height,'ox':box[0]-128,'oy':box[1]-115.2,'page':a['pages'].index(page)}
 manifest.append({'frame':name,'source':source.name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'crop':list(box)})
 x+=tile.width+2;rh=max(rh,tile.height)
# The attachment has one frame per direction; share it between idle and movement.
a['groups']['car']=a['groups']['car-blue']={'dirs':32,'anim':{'stand':rows,'walk':rows},'intervals':{'stand':.12,'walk':.1}}
atlas.crop((0,0,1024,y+rh)).quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets'/page,optimize=True)
p.write_text('(function(){const data='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.ZergArt=data;})();')
(S/'manifest.json').write_text(json.dumps({'mailbox':'xinline_report@qq.com','sender':'Tommy','subject':'2026主角战车1014渲染','received':'2026-10-13 17:49 Asia/Shanghai','description':'17方向主角战车带灯光','pivot':[128,115.2],'frames':manifest},ensure_ascii=False,indent=2))
prov=R/'art-provenance.json';records=json.loads(prov.read_text());records=[r for r in records if not r.get('frame','').startswith('car-base-20261013/')]
records += [{'frame':r['frame'],'source':'source-art/jeep-base-20261013/'+r['source']} for r in manifest];prov.write_text(json.dumps(records,ensure_ascii=False,indent=2))
print('Imported 17 native directions:',(R/'assets'/page).stat().st_size,'bytes')
