from pathlib import Path
from lupa import LuaRuntime,lua_type
from PIL import Image,ImageChops,ImageStat
import re,json,struct,hashlib
R=Path(__file__).resolve().parents[1]; S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data'
lua=LuaRuntime(unpack_returned_tuples=True);lua.execute('os=nil;io=nil;package=nil;require=nil;function stub() return setmetatable({}, {__index=function(t,k) local v=stub();rawset(t,k,v);return v end}) end;hVar=stub();hApi=stub()')
def clean(s):
 out=[];i=0;quote=None
 while i<len(s):
  c=s[i]
  if quote:
   out.append(c)
   if c=='\\' and i+1<len(s):i+=1;out.append(s[i])
   elif c==quote:quote=None
  elif c in '\"\'':quote=c;out.append(c)
  elif s[i:i+4]=='--[[':
   end=s.find(']]',i+4);i=(end+1 if end>=0 else len(s))
  elif s[i:i+2]=='--':
   end=s.find('\n',i+2);i=(end-1 if end>=0 else len(s))
  else:out.append(c)
  i+=1
 return ''.join(out)
def table(src,start):
 i=src.index('{',start);depth=0;quote=None;escape=False
 for j in range(i,len(src)):
  c=src[j]
  if quote:
   if escape:escape=False
   elif c=='\\':escape=True
   elif c==quote:quote=None
  elif c in '\"\'':quote=c
  elif c=='{':depth+=1
  elif c=='}':
   depth-=1
   if depth==0:return src[i:j+1]
 raise ValueError('unclosed table')
def native(t):
 if lua_type(t)!='table':return t if isinstance(t,(int,float,str,bool,type(None))) else None
 keys=list(t.keys())
 if not keys:return []
 if all(isinstance(k,int) for k in keys) and sorted(keys)==list(range(1,len(keys)+1)):return [native(t[i]) for i in range(1,len(keys)+1)]
 return {str(k):native(t[k]) for k in keys if isinstance(k,(str,int))}
M=R/'source-map' if (R/'source-map/yxys_zerg_002.dat').exists() else S/'map/world'
maptext=(M/'yxys_zerg_002.dat').read_text();lua.execute(maptext)
units=native(lua.globals().units_list);triggers=native(lua.globals().units_data)
source=clean((S/'tabs/tab_unit.lua').read_text());ids=sorted(set([u[1] for u in units]+[6000,6109,6003,6006,6013,6014,17000,17017,*range(20109,20126),12500,12501,12502,12503,12504,12509,12511,12542,16013,12009,12010,12202,12203]))
unitdata={}
for id in ids:
 hits=list(re.finditer(r'_tab_unit\['+str(id)+r'\]\s*=',source))
 if not hits:continue
 expr=table(source,hits[-1].end())
 try:unitdata[id]=native(lua.eval(expr))
 except Exception as e:print('UNIT FAIL',id,str(e)[:100])
itemsource=clean((S/'tabs/tab_item.lua').read_text());itemdata={}
for id in [11200,12009,12010,*range(12013,12026),12202,12203,20301,20203,20217,20204,20309,20102,20104,20302]:
 hits=list(re.finditer(r'_tab_item\['+str(id)+r'\]\s*=',itemsource))
 if hits:itemdata[id]=native(lua.eval(table(itemsource,hits[-1].end())))
strings=(S/'tabs/tab_string.lua').read_text()
for iid,item in itemdata.items():
 match=re.search(r'_tab_stringI\['+str(iid)+r'\]\s*=\s*\{\s*"([^"]+)"',strings)
 if match:item['name']=match.group(1)
settings=next(t for t in triggers if t.get('totalWave'))
waves=[]
for wave in range(8):
 entries=[]
 for t in triggers:
  if t['uniqueID'] not in range(1,9):continue
  for group in t['unitPerWave'][wave]:
   fields=group.split('|');idspec=fields[4].split('*');entries.append({'spawn':t['uniqueID'],'path':int(fields[0]),'formation':int(fields[1]),'nextDelay':int(fields[2]),'perUnitDelay':int(fields[3]),'unit':int(idspec[0]),'count':int(idspec[1]),'beginWaveDelay':t['beginWaveDelay'][wave],'raw':group})
 waves.append(entries)
# Terrain header is SXLTerrainHeader in XLTerrain.h; records follow TerrainLoadFromFile.
b=(M/'yxys_zerg_002.ter').read_bytes();flag,ver,w,h,n,default,_,_=struct.unpack_from('<4h4i',b);assert(flag,ver)==(0x66,1)
tiles=[[(default,15)] for _ in range(w*h)];off=24
while off<len(b):
 x,y,count=struct.unpack_from('<hhB',b,off);off+=5;ls=[]
 for i in range(count):ls.append(struct.unpack_from('BB',b,off));off+=2
 tiles[y*w+x]=ls
assert off==len(b)
textures={n:Image.open(S/'terrain'/f't_{n:02}.png').convert('RGBA') for n in {n for ls in tiles for n,a in ls if n}}
alpha=Image.open(S/'terrain/alpha01.png').convert('RGBA');ground=Image.new('RGBA',(w*64,h*64))
for y in range(h):
 for x in range(w):
  for n,a in tiles[y*w+x]:
   if not n:break
   if not a:continue
   tex=textures[n];tw,th=tex.size
   if tw==512:
    tx,ty=(256+x%4*64,y%4*64) if a==15 else (a%4*64,a//4*64)
   else:tx,ty=x%(tw//64)*64,y%(th//64)*64
   im=tex.crop((tx,ty,tx+64,ty+64))
   if tw!=512 and a!=15:
    ax,ay=(a-1)%4*64,(a-1)//4*64;mask=alpha.crop((ax,ay,ax+64,ay+64)).getchannel('A');im.putalpha(ImageChops.multiply(im.getchannel('A'),mask))
   ground.alpha_composite(im,(x*64,y*64))
ground.save(R/'assets/terrain.png',optimize=True)
data={'map':'world/yxys_zerg_002','title':'异虫','size':[w*64,h*64],'terrainTiles':tiles,'units':units,'triggers':triggers,'settings':settings,'waves':waves,'unitTypes':unitdata,'itemTypes':itemdata}
# Experimental roadside construction mask. Classify the original blended terrain,
# not pathfinding waypoints: texture 6 is road, 4/5 roadside, others void/edge.
mask=Image.new('L',(w*64,h*64))
for y in range(h):
 for x in range(w):
  for tid,a in tiles[y*w+x]:
   if not tid:break
   if not a:continue
   value=255 if tid==6 else 128 if tid in (4,5) else 0
   tile=Image.new('L',(64,64),value)
   if a==15:mask.paste(tile,(x*64,y*64))
   else:
    ax,ay=(a-1)%4*64,(a-1)//4*64
    mask.paste(tile,(x*64,y*64),alpha.crop((ax,ay,ax+64,ay+64)).getchannel('A'))
cells=[]
for y in range(h*4):
 for x in range(w*4):
  mean=ImageStat.Stat(mask.crop((x*16,y*16,x*16+16,y*16+16))).mean[0]
  cells.append(2 if mean>=192 else 1 if mean>=96 else 0)
data['buildTerrain']={'cellSize':16,'cols':w*4,'rows':h*4,'cells':cells,'roadTexture':6,'sideTextures':[4,5]}
(R/'shared/level-data.js').write_text('(function(){const d='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergLevel=d;})();')
(R/'source-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
print('map',w,h,'objects',len(units),'triggers',len(triggers),'wave counts',[sum(e['count'] for e in wave) for wave in waves]);print('models',{i:d.get('model') for i,d in unitdata.items()})

import runpy
runpy.run_path(str(R/"tools/import-equipment-info.py"),run_name="__main__")
