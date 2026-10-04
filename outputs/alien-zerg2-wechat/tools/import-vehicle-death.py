"""Import the native simultaneous vehicle/driver/laser-gunner death sequence."""
from pathlib import Path
import json,plistlib,re,shutil
from PIL import Image
R=Path(__file__).resolve().parents[1];S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data/image/effect'
parts=[('vehicle-wreck','jeep_dead13',.45),('driver-death','jeepgun_dead1',.5),('driver-death-alt','jeepgun_dead15',.5),('gunner-death','jeepgun_dead8',.5)]
frames={};groups={};items=[];nums=lambda v:list(map(int,re.findall(r'-?\d+',v)))
for role,model,ay in parts:
 meta=plistlib.loads((S/(model+'.plist')).read_bytes());atlas=Image.open(S/(model+'.png')).convert('RGBA');groups[role]=[]
 for key,f in sorted(meta['frames'].items(),key=lambda kv:[int(v) if v.isdigit() else v for v in re.split(r'(\d+)',kv[0])]):
  x,y,w,h=nums(f['frame']);rot=f.get('rotated',False);im=atlas.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
  if rot:im=im.transpose(Image.Transpose.ROTATE_90)
  sw,sh=nums(f['sourceSize']);cx,cy=nums(f['sourceColorRect'])[:2];name=role+'/'+str(len(groups[role]));groups[role].append(name);frames[name]={'w':im.width,'h':im.height,'ox':cx-sw*.5,'oy':cy-sh*ay};items.append((name,im))
x=y=row=0
for name,im in items:
 if x+im.width>1024:x=0;y+=row+2;row=0
 frames[name].update(x=x,y=y);x+=im.width+2;row=max(row,im.height)
canvas=Image.new('RGBA',(1024,y+row))
for name,im in items:canvas.paste(im,(frames[name]['x'],frames[name]['y']))
for folder in [R,R.parent/'alien-wolf-wechat']:
 canvas.save(folder/'assets/vehicle-death.png',optimize=True)
 p=folder/'shared/art-data.js';s=p.read_text();a=json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')]);page='vehicle-death.png'
 if page not in a['pages']:a['pages'].append(page)
 for k,v in frames.items():a['frames'][k]={**v,'page':a['pages'].index(page)}
 a['groups'].update(groups);p.write_text('(function(){const d='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();\n')
print('Native death frames',len(items),'bytes',(R/'assets/vehicle-death.png').stat().st_size)
