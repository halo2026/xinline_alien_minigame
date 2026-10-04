"""Import native Zerg I escort geometry, waves, scenery and truck animations."""
from pathlib import Path
import json,re,struct,plistlib
from PIL import Image,ImageChops,ImageStat
R=Path(__file__).resolve().parents[1]
# Reuse the source Lua table parser without running the Zerg II export.
parser=(R/'tools/extract-source.py').read_text();exec(parser[parser.index('from lupa'):parser.index('M=R/')].replace("R=Path(__file__).resolve().parents[1]","R=R"))
lua.execute((S/'map/world/yxys_zerg_001.dat').read_text());units=native(lua.globals().units_list);triggers=native(lua.globals().units_data);settings=next(t for t in triggers if t.get('totalWave'))
source=clean((S/'tabs/tab_unit.lua').read_text());defs={}
for uid in [5048,5049,5114,11256,12514,12516,12517]:
 hits=list(re.finditer(r'_tab_unit\['+str(uid)+r'\]\s*=',source));raw=native(lua.eval(table(source,hits[-1].end())));defs[str(uid)]={k:raw[k] for k in ['name','model','xlobj','scale','box','attr','drop'] if k in raw}
waves=[]
for wave in range(settings['totalWave']):
 entries=[]
 for t in triggers:
  if not t.get('beginWaveDelay'):continue
  for group in t['unitPerWave'][wave]:
   f=group.split('|');unit,count,*rest=map(int,f[4].split('*'));entries.append(dict(spawn=t['uniqueID'],path=abs(int(f[0])),formation=int(f[1]),nextDelay=int(f[2]),perUnitDelay=int(f[3]),unit=unit,count=count,beginWaveDelay=t['beginWaveDelay'][wave],convoy=unit==12514))
 waves.append(entries)
# Native corner tiles, shared mask for opaque transition atlases.
b=(S/'map/world/yxys_zerg_001.ter').read_bytes();flag,ver,w,h,n,default,_,_=struct.unpack_from('<4h4i',b);tiles=[[(default,15)] for _ in range(w*h)];off=24
while off<len(b):
 x,y,count=struct.unpack_from('<hhB',b,off);off+=5;ls=[]
 for i in range(count):ls.append(struct.unpack_from('BB',b,off));off+=2
 tiles[y*w+x]=ls
textures={n:Image.open(S/'terrain'/f't_{n:02}.png').convert('RGBA') for ls in tiles for n,a in ls if n};alpha=Image.open(S/'terrain/alpha01.png').convert('RGBA');ground=Image.new('RGBA',(w*64,h*64));road=Image.new('L',ground.size)
for y in range(h):
 for x in range(w):
  for n,a in tiles[y*w+x]:
   if not n:break
   if not a:continue
   tex=textures[n];tw,th=tex.size
   tx,ty=((256+x%4*64,y%4*64) if a==15 else (a%4*64,a//4*64)) if tw==512 else (x%(tw//64)*64,y%(th//64)*64)
   im=tex.crop((tx,ty,tx+64,ty+64))
   if a!=15 and tw!=512:im.putalpha(ImageChops.multiply(im.getchannel('A'),alpha.crop((((a-1)%4)*64,((a-1)//4)*64,((a-1)%4+1)*64,((a-1)//4+1)*64)).getchannel('A')))
   ground.alpha_composite(im,(x*64,y*64))
   if n==6:road.paste(im.getchannel('A'),(x*64,y*64))
cols,rows=w*4,h*4;cells=[];landalpha=ground.getchannel('A')
for y in range(rows):
 for x in range(cols):
  box=(x*16,y*16,x*16+16,y*16+16);land=ImageStat.Stat(landalpha.crop(box)).mean[0];rv=ImageStat.Stat(road.crop(box)).mean[0];cells.append(0 if land<128 else 2 if rv>=90 else 1)
ground.resize((w*32,h*32),Image.Resampling.LANCZOS).quantize(colors=192,method=Image.Quantize.FASTOCTREE).save(R/'assets/zerg1-terrain.png',optimize=True)
# Pack only new art. Existing rock sprites are shared with Zerg II.
frames={};groups={};items=[]
def add(n,im,ox,oy,src):
 im=im.convert('RGBA');frames[n]={'w':im.width,'h':im.height,'ox':ox,'oy':oy};items.append((n,im))
extract=(R/'tools/extract-art.py').read_text();exec(extract[extract.index('def crop('):extract.index('models=')])
props=[];blocks=set();pf=plistlib.load((S/'xlobj/xlobjs.plist').open('rb'))['frames']
for uid in [5048,5049,5114]:
 model=defs[str(uid)]['xlobj'];p=S/'xlobj/xlobjs.plist';key=f'data/xlobj/{model}.png';sw,sh=crop(p,key,'zerg1prop/'+str(uid));data=(S/'xlobj'/f'{model}.bif').read_bytes()
 for u in units:
  if u[0]!=4 or u[1]!=uid:continue
  prop={'frame':'zerg1prop/'+str(uid),'x':u[3],'y':u[4],'w':sw,'h':sh,'flip':bool(u[5]),'blocks':[]}
  for x in range(20):
   for y in range(20):
    if len(data)>=1228 and data[28+x*20+y]:
     cell=(int((int((u[3]-sw/2)/16)+(int(sw/16)-1-x if u[5] else x))*16+8)//24,int((int((u[4]-sh/2)/16)+y)*16+8)//24);blocks.add(cell);prop['blocks'].append(cell)
  props.append(prop)
# Truck uses the original UNIT_TRUCK model family.
modelsource=(S/'tabs/model/tab_model.lua').read_text(errors='ignore');hit=re.search(r'\["?UNIT_TRUCK"?\]\s*=',modelsource)
print('truck model source',modelsource[hit.start():hit.start()+450] if hit else 'see truck plists')
for p in [S/'image/unit/truck_world.plist',S/'image/unit/truck_battle.plist']:
 if not p.exists():continue
 for k in sorted(plistlib.load(p.open('rb'))['frames']):
  action=k.split('/')[-2]
  if action not in ['stand','walk','dead']:continue
  row=int(Path(k).stem)//10000;frame='convoy/'+action+'/'+str(row)+'/'+str(int(Path(k).stem)%10000);crop(p,k,frame,.5,.5);groups.setdefault('convoy',{'dirs':8,'anim':{},'intervals':{'stand':.12,'walk':.12,'dead':.12}})['anim'].setdefault(action,{}).setdefault(str(row),[]).append(frame)
assert 'convoy' in groups,'native truck atlas missing'
x=y=rowh=0;atlas=Image.new('RGBA',(1024,1024))
for n,im in items:
 if x+im.width>1024:x=0;y+=rowh;rowh=0
 assert y+im.height<=1024
 atlas.alpha_composite(im,(x,y));frames[n].update(x=x,y=y);x+=im.width+2;rowh=max(rowh,im.height+2)
atlas.crop((0,0,1024,y+rowh)).quantize(colors=192,method=Image.Quantize.FASTOCTREE).save(R/'assets/zerg1-scenery.png',optimize=True)
points={u[6]:{'x':u[3],'y':u[4]} for u in units if u[0]==11}
data=dict(map='world/yxys_zerg_001',title='护矿使者',size=[w*64,h*64],units=units,triggers=triggers,settings=settings,waves=waves,unitTypes=defs,buildTerrain=dict(cellSize=16,cols=cols,rows=rows,cells=cells),terrainGrid={'roadsBaked':True},navigationBounds=dict(left=64,top=64,right=w*64-64,bottom=h*64-64),campaignConfig=dict(id='zerg1',convoy=True,playerStart=points[2],spawnIds=[11,13,15,17],convoySpawn=3,convoyRoute=settings['pathList'][0],lossLimit=3,bossIds=[12517]),art=dict(frames=frames,groups=groups,props=props,blocks=sorted(blocks)))
out=R/'shared/zerg1-data.js';out.write_text('(function(){const data='+json.dumps(data,separators=(',',':'),ensure_ascii=False)+';if(typeof module!=="undefined")module.exports=data;else globalThis.ZergOneData=data;})();')
print('Imported',len(waves),'waves,',len(props),'props,',len(frames),'frames',data['size'])
