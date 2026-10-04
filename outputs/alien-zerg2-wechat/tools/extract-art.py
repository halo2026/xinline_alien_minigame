from pathlib import Path
from PIL import Image,ImageChops
import plistlib,re,json,hashlib,struct
R=Path(__file__).resolve().parents[1];S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data';D=json.loads((R/'source-data.json').read_text());frames={};groups={};items=[];sources=[]
def add(n,im,ox,oy,src):
 im=im.convert('RGBA');frames[n]={'w':im.width,'h':im.height,'ox':ox,'oy':oy};items.append((n,im));sources.append({'frame':n,'source':str(src.relative_to(S))})
def crop(p,k,n,anchor=.5,anchorX=.5):
 f=plistlib.load(p.open('rb'))['frames'][k]; nums=lambda s:list(map(int,re.findall(r'-?\d+',s)));x,y,w,h=nums(f.get('frame',f.get('textureRect')));rot=f.get('rotated',f.get('textureRotated',False));im=Image.open(p.with_suffix('.png')).crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:im=im.transpose(Image.Transpose.ROTATE_90)
 sw,sh=nums(f.get('sourceSize',f.get('spriteSourceSize')));cx,cy=(nums(f['sourceColorRect'])[:2] if 'sourceColorRect' in f else ((sw-w)/2+nums(f['spriteOffset'])[0],(sh-h)/2-nums(f['spriteOffset'])[1]));add(n,im,cx-sw*anchorX,cy-sh*anchor,p);return sw,sh
models={'car':('jeep3',32,.45),'gun':('jeepgun22',32,.45),'normalgun':('jeepgun',32,.45),'flamegun':('jeepgun1',32,.45),'towerlaser':('jeepgun11',32,.45),'shotgun':('jeepgun2',32,.45),'12500':('zhangyuguai_small',8,.55),'12501':('warrior',8,.5),'12502':('hydralisk_small',8,.55),'12504':('bigbeetle',8,.5),'12509':('dragon',2,.5),'12511':('yoda',4,.5),'refinery':('binggongchang',2,.3)}
for role,(model,dirs,anchor) in models.items():
 groups[role]={'dirs':dirs,'anim':{},'intervals':{'stand':.12,'walk':.12 if role in ['12511','12509','12504'] else .1,'attack':.1 if role=='12504' else .12,'skill':.12,'dead':.12}}
 ps=[S/'image/unit'/f'{model}.plist'] if dirs==32 else [S/'image/unit'/f'{model}_world.plist',S/'image/unit'/f'{model}_battle.plist']
 for p in ps:
  if not p.exists():continue
  for k in sorted(plistlib.load(p.open('rb'))['frames']):
   action=k.split('/')[-2]
   if action not in ['stand','walk','attack','dead','skill']:continue
   row=int(Path(k).stem)//10000;n=f'{role}/{action}/{row}/{int(Path(k).stem)%10000}';crop(p,k,n,anchor,.45 if role=='shotgun' else .5);groups[role]['anim'].setdefault(action,{}).setdefault(str(row),[]).append(n)
groups['12503']=groups['12501']
# Scenery uses the original packed xlobj frames and 24-pixel BIF grid.
props=[];blocks=set();p=S/'xlobj/xlobjs.plist';pf=plistlib.load(p.open('rb'))['frames']
for uid,ud in D['unitTypes'].items():
 model=ud.get('xlobj')
 if not isinstance(model,str) or not any(u[0]==4 and u[1]==int(uid) for u in D['units']):continue
 key=f'data/xlobj/{model}.png';n='prop/'+uid
 if key in pf:sw,sh=crop(p,key,n)
 elif (S/'xlobj'/f'{model}.png').exists():
  im=Image.open(S/'xlobj'/f'{model}.png');sw,sh=im.size;add(n,im,-sw/2,-sh/2,S/'xlobj'/f'{model}.png')
 else:print('MISSING PROP',model);continue
 groups[n]=[n]
 bpath=S/'xlobj'/f'{model}.bif';b=bpath.read_bytes() if bpath.exists() else b''
 for u in D['units']:
  if u[0]!=4 or u[1]!=int(uid):continue
  props.append({'frame':n,'x':u[3],'y':u[4],'w':sw,'h':sh,'flip':bool(u[5]),'blocks':[]})
  if len(b)>=1228:
   for x in range(20):
    for y in range(20):
     if b[28+x*20+y]:
      cell=(int((int((u[3]-sw/2)/16)+(int(sw/16)-1-x if u[5] else x))*16+8)//24,int((int((u[4]-sh/2)/16)+y)*16+8)//24);blocks.add(cell);props[-1]['blocks'].append(cell)
for group,model in [('spark','behit_jiguanpao_b'),('explosion','pojiadanbaozha'),('flame','fire02'),('grenadeboom','behit_tegong_c'),('impactspark','spark3'),('crater','dankeng')]:
 p=S/'image/effect'/f'{model}.plist';groups[group]=[]
 for k in sorted(plistlib.load(p.open('rb'))['frames']):
  n=f'{group}/{len(groups[group])}';crop(p,k,n);groups[group].append(n)
p=S/'image/effect/pojiadanbaozha.plist';groups['grenadecritical']=[]
for k in sorted(plistlib.load(p.open('rb'))['frames']):
 n='grenadecritical/'+str(len(groups['grenadecritical']));sw,sh=crop(p,k,n);frames[n]['ox']+=sw*.1;groups['grenadecritical'].append(n)
for group,file,w,h,count,row in [('blood','blood_new',112,80,4,0),('gore','blood_new',112,80,7,3),('burst','burst_3',64,64,3,0),('charge','charge_tower',54,114,2,0),('grenade','zhadan',42,42,3,0),('laserhit','laser_long_hit',84,84,4,0)]:
 p=S/'image/effect'/f'{file}.png'
 if not p.exists():print('MISSING FX',file);continue
 im=Image.open(p);groups[group]=[]
 for i in range(count):
  n=f'{group}/{i}';add(n,im.crop((i*w,row*h,(i+1)*w,(row+1)*h)),-w/2,-h/2,p);groups[group].append(n)
p=S/'image/misc/splashlight/mask000.png';im=Image.open(p).convert('RGBA');red=ImageChops.multiply(im,Image.new('RGBA',im.size,(255,0,0,255)));add('laserlight',red,-im.width/2,-im.height/2,p)
p=S/'image/effect/laser.png';im=Image.open(p).convert('RGBA');add('bullettrail',im,-im.width/2,-im.height/2,p)
# Source flame hit 668: twenty 192px cells, 50ms, anchor .5/.8.
for group,file,w,h,cols,count,anchor in [('flamehit','burst_1',192,192,5,20,.8),('flamemuzzle','laserball_explosion',30,32,5,5,.5)]:
 p=S/'image/effect'/f'{file}.png';im=Image.open(p).convert('RGBA');groups[group]=[]
 if group=='flamemuzzle':im=ImageChops.multiply(im,Image.new('RGBA',im.size,(255,128,0,255)))
 for i in range(count):
  n=f'{group}/{i}';x=i%cols*w;y=i//cols*h;add(n,im.crop((x,y,x+w,y+h)),-w/2,-h*anchor,p);groups[group].append(n)
# Native enemy attacks: effect3184 claw and effect3234 model dead animation.
for group,file,w,h,count,anchor in [('enemyclaw','zhua',150,150,3,.5),('enemyfirehit','burst_2',64,64,6,.8)]:
 p=S/'image/effect'/f'{file}.png';im=Image.open(p).convert('RGBA');groups[group]=[]
 for i in range(count):
  n=f'{group}/{i}';add(n,im.crop((i*w,0,(i+1)*w,h)),-w/2,-h*anchor,p);groups[group].append(n)
# Original gun-tower pedestal and construction UI textures.
for name,file in [('towerbase','effect/taizi_ex1.png'),('buildbutton','misc/chariotconfig/di_jianzao.png'),('shoprow','misc/addition/di_5pick1_normal.png'),('crystalicon','misc/skillup/mu_coin.png'),('buildselect','icon/item/towergun_selectbox.png')]+[('towericon/'+str(12200+i),'icon/item/towergun_'+str(i+1)+'.png') for i in range(4)]:
 p=S/'image'/file;im=Image.open(p);add(name,im,-im.width/2,-im.height/2,p)
p=S/'image/effect/zidan.plist';crop(p,'zidan3-1.png','bullet');groups['bullet']=['bullet']
p=S/'xlobj/bunker.png'
if p.exists():
 im=Image.open(p);add('bunker',im,-im.width/2,-im.height/2,p);groups['bunker']=['bunker']
for group,file,w,h,cols,rows in [('bossdeath','worm_dead_effect',300,300,3,4),('enemyfire','fireball8',32,64,8,4),('enemyacid','koushui',37,43,5,1)]:
 p=S/'image/effect'/f'{file}.png';im=Image.open(p);groups[group]=[]
 for i in range(cols*rows):
  n=f'{group}/{i}';x=i%cols*w;y=i//cols*h;add(n,im.crop((x,y,x+w,y+h)),-w/2,-h/2,p);groups[group].append(n)
p=S/'image/effect/laser_long.png';im=Image.open(p);groups['laser']=[]
for i,row in enumerate([0,2,3,3,3,3,3]):
 n=f'laser/{i}';add(n,im.crop((0,row*40,300,(row+1)*40)),-150,-20,p);groups['laser'].append(n)
p=S/'image/effect/alien_liquid_stain_v1.png';im=Image.open(p);add('stain',im,-im.width/2,-im.height/2,p);groups['stain']=['stain']
for name,color in [('green',(137,174,42)),('burn',(62,40,30))]:
 tinted=ImageChops.multiply(im.convert('RGB'),Image.new('RGB',im.size,color)).convert('RGBA');tinted.putalpha(im.getchannel('A'));tinted.thumbnail((256,256),Image.Resampling.LANCZOS);add('stain/'+name,tinted,-tinted.width/2,-tinted.height/2,p)
# Native tank level-up effect 3333: Summon_3, ten 60ms frames.
p=S/'image/effect/Summon_1.png';im=Image.open(p).convert('RGBA');groups['tanklevelup']=[]
for i in range(10):
 n=f'tanklevelup/{i}';x=i%4*76;y=i//4*145;add(n,im.crop((x,y,x+76,y+145)),-38,-145*.75,p);groups['tanklevelup'].append(n)
for iid in [20301,20203,20217,20204,20309,20102,20104,20302]:
 p=S/'image'/D['itemTypes'][str(iid)]['icon'];im=Image.open(p);add('equipment/'+str(iid),im,-im.width/2,-im.height/2,p)
for name,file in [('tanklevelicon','icon/portrait/tank_icon01.png'),('weaponlevelicon','icon/item/gun_5.png')]:
 p=S/'image'/file;im=Image.open(p);add(name,im,-im.width/2,-im.height/2,p)
# Original inventory/drop icon atlas, keeping transparent trim offsets.
for iid,it in D['itemTypes'].items():
 ud=D['unitTypes'].get(str(it.get('dropUnit')),{});m=ud.get('model')
 if not m:continue
 n='pickup/'+iid
 if m.startswith('UI:buff_n'):
  crop(S/'image/ui2.plist','image/ui/'+m[3:]+'.png',n)
 elif (S/'image'/m).exists():
  p=S/'image'/m;im=Image.open(p);add(n,im,-im.width/2,-im.height/2,p)
p=S/'image/icon/item/chest_7.png'
if p.exists():
 im=Image.open(p);add('chest',im,-im.width/2,-im.height/2,p)
p=S/'image/effect/alien_gore_atlas_v1.png';im=Image.open(p);cw,ch=im.width//2,im.height//2
for i in [0,2]:
 part=im.crop((i%2*cw,i//2*ch,(i%2+1)*cw,(i//2+1)*ch));add('body/'+str(i),part,-cw/2,-ch/2,p)
 for j,cut in enumerate([(0.08,.28,.45,.55),(.32,.08,.40,.45),(.45,.48,.45,.43)]):
  x,y,w,h=cut;bit=part.crop((int(x*cw),int(y*ch),int((x+w)*cw),int((y+h)*ch)));add(f'limb/{i}/{j}',bit,-bit.width/2,-bit.height/2,p)
# Each <=1024 square PNG is a separate WeChat subpackage, preserving source pixels.
size=1024;atlas=Image.new('RGBA',(size,size));x=y=rowh=page=0;pages=[];seen={}
def save():
 file=f'atlas-{page}.png';atlas.crop((0,0,size,y+rowh)).save(R/'assets'/file,optimize=True);pages.append(file)
for n,im in sorted(items,key=lambda t:-t[1].height):
 key=(im.size,hashlib.sha256(im.tobytes()).digest())
 if key in seen:frames[n].update(seen[key]);continue
 w,h=im.size
 if x+w+2>size:x=0;y+=rowh+2;rowh=0
 if y+h+2>size:save();page+=1;atlas=Image.new('RGBA',(size,size));x=y=rowh=0
 if w>size or h>size:
  if y+rowh:save();page+=1
  file=f'atlas-{page}.png';im.save(R/'assets'/file,optimize=True);pages.append(file);frames[n].update({'x':0,'y':0,'page':page});page+=1;atlas=Image.new('RGBA',(size,size));x=y=rowh=0;continue
 atlas.paste(im,(x,y));v={'x':x,'y':y,'page':page};frames[n].update(v);seen[key]=v;x+=w+2;rowh=max(rowh,h)
save();out={'pages':pages,'frames':frames,'groups':groups,'props':props,'blocks':sorted(blocks),'blockSize':24}
(R/'shared/art-data.js').write_text('(function(){const d='+json.dumps(out,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();')
(R/'art-provenance.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2));print(len(frames),'frames',len(pages),'pages',len(props),'props',len(blocks),'blocks')

for old in (R/"assets").glob("atlas-*.png"):
 if old.name not in pages:old.unlink()

# Preserve imported original armory panels when rebuilding atlases.
import runpy
runpy.run_path(str(R/"tools/import-ui-panels.py"),run_name="__main__")

runpy.run_path(str(R/"tools/import-tactics.py"),run_name="__main__")
