"""Import original Jeep skin directions and death frames; preserve native pivots and dimensions."""
from pathlib import Path
import json,plistlib,re,hashlib
from PIL import Image
R=Path(__file__).resolve().parents[1];S=Path('/Users/wangxin/Documents/projects/source/data/image')
frames={};groups={};items=[];nums=lambda t:list(map(int,re.findall(r'-?\d+',t)))
for key,model,anchor,death in [('green','jeep_green',.55,'jeep_dead1'),('black','jeep_black',.45,'jeep_dead11'),('red','jeep16',.45,'jeep_dead14')]:
 role='car-'+key;groups[role]={'dirs':32,'anim':{},'intervals':{'stand':.1,'walk':.1}}
 for folder,stem,ay in [('unit',model,anchor),('effect',death,.55 if key=='green' else .65 if key=='red' else .45)]:
  p=S/folder/(stem+'.plist');meta=plistlib.load(p.open('rb'));atlas=Image.open(p.with_suffix('.png')).convert('RGBA');dead=folder=='effect';group='vehicle-wreck-'+key
  if dead:groups[group]=[]
  for source,f in sorted(meta['frames'].items(),key=lambda kv:[int(v) if v.isdigit() else v for v in re.split(r'(\d+)',kv[0])]):
   action='dead' if dead else source.split('/')[-2]
   if not dead and action not in ['stand','walk']:continue
   x,y,w,h=nums(f.get('frame',f.get('textureRect')));rot=f.get('rotated',f.get('textureRotated',False));im=atlas.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
   if rot:im=im.transpose(Image.Transpose.ROTATE_90)
   sw,sh=nums(f.get('sourceSize',f.get('spriteSourceSize')))
   if 'sourceColorRect' in f:cx,cy=nums(f['sourceColorRect'])[:2]
   else:dx,dy=nums(f['spriteOffset']);cx,cy=(sw-w)/2+dx,(sh-h)/2-dy
   if dead:name=group+'/'+str(len(groups[group]));groups[group].append(name)
   else:
    row=int(Path(source).stem)//10000;name=f'{role}/{action}/{row}/{int(Path(source).stem)%10000}';groups[role]['anim'].setdefault(action,{}).setdefault(str(row),[]).append(name)
   # Trim empty padding without moving the original anchor.
   box=im.getbbox() or (0,0,1,1);im=im.crop(box);cx+=box[0];cy+=box[1]
   frames[name]={'w':im.width,'h':im.height,'ox':cx-sw*(.48 if dead and key=='red' else .5),'oy':cy-sh*ay};items.append((name,im))
size=1024;canvas=Image.new('RGBA',(size,size));x=y=row=page=0;seen={};pages=[]
def save():
 name=f'jeep-skins-{page}.png';out=canvas.crop((0,0,size,y+row));out.quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets'/name,optimize=True);pages.append(name)
for name,im in sorted(items,key=lambda t:-t[1].height):
 key=(im.size,hashlib.sha256(im.tobytes()).digest())
 if key in seen:frames[name].update(seen[key]);continue
 w,h=im.size
 if x+w+2>size:x=0;y+=row+2;row=0
 if y+h+2>size:save();page+=1;canvas=Image.new('RGBA',(size,size));x=y=row=0
 canvas.paste(im,(x,y));pos={'page':page,'x':x,'y':y};seen[key]=pos;frames[name].update(pos);x+=w+2;row=max(row,h)
save()
for folder in [R,R.parent/'alien-wolf-wechat']:
 p=folder/'shared/art-data.js';s=p.read_text();a=json.JSONDecoder().raw_decode(s[s.index('const data=')+11:])[0]
 for file in pages:
  if file not in a['pages']:a['pages'].append(file)
  if folder!=R:(folder/'assets'/file).write_bytes((R/'assets'/file).read_bytes())
 for k,f in frames.items():a['frames'][k]={**f,'page':a['pages'].index(pages[f['page']])}
 a['groups'].update(groups);a['groups']['car-blue']=a['groups']['car'];p.write_text('(function(root){const data='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else root.ZergArt=data;})(typeof globalThis!=="undefined"?globalThis:this);\n')
print(len(frames),'frames',len(seen),'unique crops',sum((R/'assets'/p).stat().st_size for p in pages),'bytes',pages)
