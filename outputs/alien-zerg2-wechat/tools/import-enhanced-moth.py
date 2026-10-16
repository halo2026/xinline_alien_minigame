"""Import Tommy's 17 directions x 2 native glow frames (2026-10-15)."""
from pathlib import Path
from PIL import Image
import json
R=Path(__file__).resolve().parents[1]
S=R.parents[1]/'source-art/mail-monsters-20261015/enhanced-moth'
p=R/'shared/mail-monsters-art.js';s=p.read_text();a=json.loads(s.split('const data=',1)[1].split(';if(typeof',1)[0])
name='enhanced-moth.png'
if name not in a['pages']:a['pages'].append(name)
page=a['pages'].index(name);atlas=Image.new('RGBA',(888,888));rows={}
for d in range(1,18):
 rows[str(d)]=[]
 for f in range(1,3):
  im=Image.open(S/f'a{d:02}{f:03}.png').convert('RGBA');assert im.size==(144,144)
  i=(d-1)*2+f-1;x=i%6*148;y=i//6*148;key=f'enhanced-moth/{d}/{f}'
  atlas.paste(im,(x+2,y+2));a['frames'][key]={'page':page,'x':x,'y':y,'w':148,'h':148,'ox':-74,'oy':-74};rows[str(d)].append(key)
a['groups']['915003']={'dirs':32,'anim':{k:rows for k in ['stand','walk','attack','dead']},'intervals':{k:.9 for k in ['stand','walk','attack','dead']}}
atlas.quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets'/name,optimize=True)
p.write_text('(function(){const data='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.MailMonstersArt=data;})();\n')
print(name,(R/'assets'/name).stat().st_size)
