"""Import authored world body and two independently aiming heads, preserving source anchors."""
from pathlib import Path
from PIL import Image
import plistlib,re,json,hashlib
R=Path(__file__).resolve().parents[1];S=R.parents[2]/'source/data/image/unit'
out={'pages':[],'frames':{},'groups':{}};items=[];seen={}
for part,uid,dirs in [('body',916000,2),('head1',916001,8),('head2',916002,8)]:
 stem='machine_snake_'+part+'_world';p=S/(stem+'.plist');frames=plistlib.load(p.open('rb'))['frames'];sheet=Image.open(p.with_suffix('.png')).convert('RGBA');g={'dirs':dirs,'anim':{},'intervals':{'stand':.12 if part=='body' else .8,'walk':.12,'attack':.1,'dead':.12}}
 for mode in ['world','battle']:
  p=S/('machine_snake_'+part+'_'+mode+'.plist');frames=plistlib.load(p.open('rb'))['frames'];sheet=Image.open(p.with_suffix('.png')).convert('RGBA')
  for k,f in frames.items():
   action=k.split('/')[-2];n=k.split('/')[-1].split('.')[0];direction=str(int(n[0]));g['anim'].setdefault(action,{}).setdefault(direction,[])
   nums=lambda v:list(map(int,re.findall(r'-?\d+',v)))
   x,y,w,h=nums(f['frame']);rot=f.get('rotated',False);im=sheet.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
   if rot:im=im.transpose(Image.Transpose.ROTATE_90)
   cx,cy,_,_=nums(f['sourceColorRect']);sw,sh=nums(f['sourceSize']);key=hashlib.sha256(im.tobytes()+str((im.size,cx,cy,sw,sh)).encode()).hexdigest()
   name=seen.get(key)
   if name is None:
    name='mechanical-snake/'+part+'/'+action+'/'+n;seen[key]=name;items.append((name,im));out['frames'][name]={'w':im.width,'h':im.height,'ox':cx-sw/2,'oy':cy-sh/2}
   g['anim'][action][direction].append(name)
 g['anim']['dead']=g['anim']['stand'];out['groups'][uid]=g
atlas=Image.new('RGBA',(1024,1024));x=y=row=0
# Preserve native resolution and source anchors; indexed atlas follows existing native sprite imports.
def save():
 name='mechanical-snake-'+str(len(out['pages']))+'.png';atlas.crop((0,0,1024,y+row)).quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets'/name,optimize=True);out['pages'].append(name)
for name,im in items:
 if x+im.width+2>1024:x=0;y+=row;row=0
 if y+im.height+2>1024:save();atlas=Image.new('RGBA',(1024,1024));x=y=row=0
 out['frames'][name].update(page=len(out['pages']),x=x,y=y);atlas.paste(im,(x,y));x+=im.width+2;row=max(row,im.height+2)
save()
(R/'shared/mechanical-snake-art.js').write_text('(function(){const data='+json.dumps(out,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.MechanicalSnakeArt=data;})();\n')
print(len(items),'unique frames',sum((R/'assets'/n).stat().st_size for n in out['pages']),'bytes')
# The archive preview uses the same independently layered native body and both heads.
preview=Image.new('RGBA',(800,800));cached=[Image.open(R/'assets'/p).convert('RGBA') for p in out['pages']];rows={}
for row,action in enumerate(['walk','attack']):
 rows[action]=[]
 for i in range(8):
  canvas=Image.new('RGBA',(400,400))
  for uid in [916000,916001,916002]:
   frames=out['groups'][uid]['anim'][action]['1'];f=out['frames'][frames[i%len(frames)]];im=cached[f['page']].crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']));canvas.alpha_composite(im,(round(200+f['ox']),round(200+f['oy'])))
  x=(i%4)*200;y=(row*2+i//4)*200;preview.paste(canvas.resize((200,200),Image.Resampling.LANCZOS),(x,y));rows[action].append([x,y,200,200])
filename='mechanical-snake-preview.png';preview.quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets'/filename,optimize=True)
p=R/'shared/bestiary-data.js';text=p.read_text();data=json.loads(text.split('const data=',1)[1].split(';if(',1)[0]);key='species:HERO_MACHINE_SNAKE_BODY:boss'
if filename not in data['pages']:data['pages'].append(filename)
page=data['pages'].index(filename);entry=dict(key=key,id=916000,stage='zerg',name='双头机械蛇',family='HERO_MACHINE_SNAKE_BODY',air=False,boss=True,tier='boss',category='首领',locations=['各战役第二幕 · 巨型怪骚扰'],frequency=1,frames={k:[[page,*a] for a in v] for k,v in rows.items()},previewSize=[200,200],worldSize=400,trait='原版双头蛇窟最终首领，机械盘蛇身与两颗独立瞄准的蛇头。',attack='激光、双头雷电弹幕、火焰喷射、召唤蛇头及短暂护盾；血量低于40%时弹幕数量翻倍。',drop=dict(min=1,guarantee=3,base=.4),combat=dict(hp=145000,damage=150,interval=1200,range=700,speed=0))
data['entries']=[e for e in data['entries'] if e['key']!=key]+[entry]
for e in data['entries']:
 if e['family']=='METAL_BEAST':e['attack']='缓慢推进，偶尔发射追踪导弹攻击战车或矿厂。'
p.write_text('(function(){const data='+json.dumps(data,separators=(',',':'),ensure_ascii=False)+';if(typeof module!=="undefined")module.exports=data;else globalThis.BestiaryData=data;})();\n')
