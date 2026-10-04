from pathlib import Path
import json,struct,re
from PIL import Image,ImageChops
from lupa import LuaRuntime,lua_type
R=Path(__file__).resolve().parents[1];S=R.parent/'cema-reference'
helpers=(R.parent/'alien-zerg2-wechat/tools/extract-source.py').read_text();exec(helpers[helpers.index('lua=LuaRuntime'):helpers.index("M=R/'source-map'")])
lua.execute((S/'map/world/td_003_tflw.dat').read_text());units=native(lua.globals().units_list);triggers=native(lua.globals().units_data);settings=next(t for t in triggers if t.get('totalWave'));points={u[6]:{'x':u[3],'y':u[4]} for u in units if u[0]==11}
waves=[[] for _ in range(settings['totalWave'])]
for t in triggers:
 for wi,groups in enumerate(t.get('unitPerWave',[]),t.get('beginWave',1)-1):
  for group in groups:
   fields=group.split('|');uid,count=map(int,fields[4].split('*'));waves[wi].append(dict(spawn=t['uniqueID'],path=int(fields[0]),formation=int(fields[1]),nextDelay=int(fields[2]),perUnitDelay=int(fields[3]),unit=uid,count=count,beginWaveDelay=(t.get('beginWaveDelay') or [0]*12)[wi] if wi<len(t.get('beginWaveDelay') or [0]*12) else 0,raw=group))
source=clean((S/'tabs/tab_unit.lua').read_text());ids=set(u[1]for u in units);ids.update(e['unit']for w in waves for e in w);ids.update([15007,16003]);unitdata={}
for uid in sorted(ids):
 hits=list(re.finditer(r'_tab_unit\['+str(uid)+r'\]\s*=',source))
 if hits:unitdata[uid]=native(lua.eval(table(source,hits[-1].end())))
b=(S/'map/world/td_003_tflw.ter').read_bytes();flag,version,w,h,_,default,_,_=struct.unpack_from('<4h4i',b);tiles=[[(default,15)]for _ in range(w*h)];off=24
while off<len(b):
 x,y,n=struct.unpack_from('<hhB',b,off);off+=5;tiles[y*w+x]=[tuple(b[off+i*2:off+i*2+2])for i in range(n)];off+=2*n
textures={n:Image.open(S/'terrain'/f't_{n:02}.png').convert('RGBA')for n in {n for layers in tiles for n,a in layers if n}};alpha=Image.open(S/'terrain/alpha01.png').convert('RGBA');ground=Image.new('RGBA',(w*64,h*64))
for i,layers in enumerate(tiles):
 x,y=i%w,i//w
 for n,a in layers:
  if not n:break
  if not a:continue
  tex=textures[n];tx,ty=((256+x%4*64,y%4*64)if a==15 else(a%4*64,a//4*64))if tex.width==512 else(x%(tex.width//64)*64,y%(tex.height//64)*64);im=tex.crop((tx,ty,tx+64,ty+64))
  if tex.width!=512 and a!=15:
   ax,ay=(a-1)%4*64,(a-1)//4*64;im.putalpha(ImageChops.multiply(im.getchannel('A'),alpha.crop((ax,ay,ax+64,ay+64)).getchannel('A')))
  ground.alpha_composite(im,(x*64,y*64))
(R/'source-map').mkdir(exist_ok=True);ground.save(R/'source-map/native-terrain.png');data=dict(map='world/td_003_tflw',title='扫除虫患',size=[w*64,h*64],units=units,triggers=triggers,settings=settings,waves=waves,points=points,unitTypes=unitdata,terrainTiles=tiles)
(R/'source-map/native-source.json').write_text(json.dumps(data,ensure_ascii=False,indent=2));print('Map size',data['size'],'counts',[sum(e['count']for e in v)for v in waves]);print('roster',{e['unit']:unitdata[e['unit']].get('attr')for v in waves for e in v})
