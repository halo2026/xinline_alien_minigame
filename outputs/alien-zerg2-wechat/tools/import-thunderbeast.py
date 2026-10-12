from pathlib import Path
from PIL import Image
import json,shutil
R=Path(__file__).resolve().parents[1];S=R.parents[1]/'source-art/mail-monsters-20261006/thunderbeast'
p=R/'shared/mail-monsters-art.js';text=p.read_text();art=json.loads(text.split('const data=',1)[1].split(';if(typeof',1)[0])
old=art['pages'];keep=[i for i,n in enumerate(old) if not n.startswith('thunderbeast-')];remap={i:j for j,i in enumerate(keep)}
art['pages']=[old[i] for i in keep];art['frames']={k:{**v,'page':remap[v['page']]} for k,v in art['frames'].items() if not k.startswith('thunderbeast/')}
# The replacement is a top-down body: use the canvas centre, not the old foot anchor.
# Keep one anchor for every action/frame so motion and attack poses do not jump.
group={'dirs':1,'anim':{},'intervals':{}};atlas=Image.new('RGBA',(1024,1024));x=y=row=0;pages=[]
def save():
 name=f'thunderbeast-{len(pages)}.png';atlas.crop((0,0,1024,y+row)).quantize(colors=128,method=Image.Quantize.FASTOCTREE).save(R/'assets'/name,optimize=True);pages.append(name);art['pages'].append(name)
for source,action in [('stand','stand'),('walk','walk'),('attack','attack'),('die','dead')]:
 group['anim'][action]={'1':[]};group['intervals'][action]=.12
 for i,f in enumerate(sorted((S/source).glob('*.png'))):
  im=Image.open(f).convert('RGBA');assert im.size==(400,400);box=im.getbbox();im=im.crop(box)
  if x+im.width+2>1024:x=0;y+=row;row=0
  if y+im.height+2>1024:save();atlas=Image.new('RGBA',(1024,1024));x=y=row=0
  key=f'thunderbeast/{action}/{i}';art['frames'][key]={'page':len(art['pages']),'x':x,'y':y,'w':im.width,'h':im.height,'ox':box[0]-200,'oy':box[1]-200};group['anim'][action]['1'].append(key);atlas.paste(im,(x,y));x+=im.width+2;row=max(row,im.height+2)
save();art['groups']['915001']=group
p.write_text('(function(){const data='+json.dumps(art,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.MailMonstersArt=data;})();\n')
for root in [R,R.parent/'alien-wolf-wechat']:
 for f in (root/'assets').glob('thunderbeast-*.png'):
  if f.name not in pages:f.unlink()
 for name in pages:
  if root!=R:shutil.copy2(R/'assets'/name,root/'assets'/name)
print({k:len(v['1']) for k,v in group['anim'].items()},sum((R/'assets'/n).stat().st_size for n in pages))
