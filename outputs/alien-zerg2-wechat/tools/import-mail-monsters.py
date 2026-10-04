from pathlib import Path
from PIL import Image
import json
R=Path(__file__).resolve().parents[1];S=R.parents[1]/'source-art/mail-monsters-20261003'
art={'pages':[],'frames':{},'groups':{}}
for stem,id in [('aerial-hive',915000),('thunderbeast',915001)]:
 group={'dirs':1,'anim':{},'intervals':{}};pages=[];atlas=Image.new('RGBA',(1024,1024));x=y=row=0
 def save():
  name=f'{stem}-{len(pages)}.png';im=atlas.crop((0,0,1024,y+row));im.quantize(colors=128,method=Image.Quantize.FASTOCTREE).save(R/'assets'/name,optimize=True);pages.append(name);art['pages'].append(name)
 for src,action in [('stand','stand'),('walk','walk'),('attack','attack'),('die','dead')]:
  group['anim'][action]={'1':[]};group['intervals'][action]=.12
  for i,p in enumerate(sorted((S/stem/src).glob('*.png'))):
   im=Image.open(p).convert('RGBA');box=im.getbbox();im=im.crop(box)
   if x+im.width+2>1024:x=0;y+=row;row=0
   if y+im.height+2>1024:save();atlas=Image.new('RGBA',(1024,1024));x=y=row=0
   name=f'{stem}/{action}/{i}';art['frames'][name]={'page':len(art['pages']),'x':x,'y':y,'w':im.width,'h':im.height,'ox':box[0]-200,'oy':box[1]-(310 if stem=='thunderbeast' else 280)};group['anim'][action]['1'].append(name);atlas.paste(im,(x,y));x+=im.width+2;row=max(row,im.height+2)
  if not group['anim'][action]['1']:group['anim'][action]=group['anim']['stand']
 save();art['groups'][id]=group
# Seventeen authored half-circle views become32 directions through renderer mirroring.
moth=Image.new('RGBA',(1024,384));rows={};page=len(art['pages']);art['pages'].append('zerg-moth.png')
for direction in range(1,18):
 im=Image.open(S/'zerg-moth'/f'a{direction:02}001.png').convert('RGBA');assert im.size==(128,128)
 x=(direction-1)%8*128;y=(direction-1)//8*128;name=f'zerg-moth/{direction}'
 moth.paste(im,(x,y));art['frames'][name]={'page':page,'x':x,'y':y,'w':128,'h':128,'ox':-64,'oy':-64}
 rows[str(direction)]=[name]
moth.save(R/'assets/zerg-moth.png',optimize=True)
art['groups'][915002]={'dirs':32,'anim':{action:rows for action in ['stand','walk','attack','dead']},'intervals':{action:.12 for action in ['stand','walk','attack','dead']}}
(R/'shared/mail-monsters-art.js').write_text('(function(){const data='+json.dumps(art,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.MailMonstersArt=data;})();\n')
print([(p,(R/'assets'/p).stat().st_size) for p in art['pages']]);print('total',sum((R/'assets'/p).stat().st_size for p in art['pages']))
