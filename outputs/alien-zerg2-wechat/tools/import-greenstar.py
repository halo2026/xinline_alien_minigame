"""Rebuild native Guangzong campaign sprites and terrain from the SVN reference export."""
from pathlib import Path
import json,re,struct,plistlib,zlib,copy
from PIL import Image,ImageChops
import greenstar_scenery as scenery
R=Path('outputs/alien-zerg2-wechat');S=Path('outputs/cema-reference');n=json.loads((R/'source-map/greenstar-native.json').read_text());defs=n['defs'];units=n['units'];triggers=n['triggers'];settings=next(t for t in triggers if t.get('totalWave'));points={u[6]:dict(x=u[3],y=u[4]) for u in units if u[0]==11}
def read(p):
 s=p.read_text();return json.loads(s.split('const d=',1)[-1].split('const data=',1)[-1].split(';if(',1)[0])
a=read(R/'shared/art-data.js');d=read(R/'shared/level-data.js');frames={};groups={};items=[];pages=[];nums=lambda s:list(map(int,re.findall(r'-?\d+',s)))
def pvr(p):
 b=zlib.decompress(p.read_bytes()[16:]);h=struct.unpack('<13I',b[:52]);assert h[6:11]==(16,61440,3840,240,15);pix=struct.unpack('<'+'H'*(h[1]*h[2]),b[52:52+h[1]*h[2]*2]);return Image.frombytes('RGBA',(h[2],h[1]),bytes(v for x in pix for v in (((x>>12)&15)*17,((x>>8)&15)*17,((x>>4)&15)*17,(x&15)*17)))
def crop(im,f):
 x,y,w,h=nums(f['frame']);q=im.crop((x,y,x+(h if f.get('rotated') else w),y+(w if f.get('rotated') else h)));return q.transpose(Image.Transpose.ROTATE_90)if f.get('rotated')else q
ids=sorted({int(g.split('|')[4].split('*')[0]) for t in triggers for w in t.get('unitPerWave',[]) for g in w}|{15007})
# Native terrain composition.
b=(S/'map/world/td_009_jmhj.ter').read_bytes();_,_,w,h,_,default,_,_=struct.unpack_from('<4h4i',b);tiles=[[(default,15)]for _ in range(w*h)];off=24
while off<len(b):
 x,y,count=struct.unpack_from('<hhB',b,off);off+=5;tiles[y*w+x]=[tuple(b[off+i*2:off+i*2+2])for i in range(count)];off+=count*2
textures={i:Image.open(S/'terrain'/f't_{i:02}.png').convert('RGBA')for ls in tiles for i,alpha in ls if i};alpha=Image.open(S/'terrain/alpha01.png').convert('RGBA');ground=Image.new('RGBA',(w*64,h*64))
for pos,ls in enumerate(tiles):
 x,y=pos%w,pos//w
 for i,mask in ls:
  if not i:break
  if not mask:continue
  tex=textures[i];tx,ty=((256+x%4*64,y%4*64)if mask==15 else(mask%4*64,mask//4*64))if tex.width==512 else(x%(tex.width//64)*64,y%(tex.height//64)*64);q=tex.crop((tx,ty,tx+64,ty+64))
  if tex.width!=512 and mask!=15:q.putalpha(ImageChops.multiply(q.getchannel('A'),alpha.crop(((mask-1)%4*64,(mask-1)//4*64,((mask-1)%4+1)*64,((mask-1)//4+1)*64)).getchannel('A')))
  ground.alpha_composite(q,(x*64,y*64))
flankRoutes=[dict(name='西侧裂谷',path=1,points=[[-160,480],[-40,480],[100,480],[180,540],[204,660],[228,780]]),dict(name='西南矿沟',path=2,points=[[-160,947],[33,947],[153,947],[333,927],[467,907],[612,948]])]
paths=scenery.routes(settings,points)+[r['points']for r in flankRoutes]
scenery.terrain(ground,paths).save(R/'assets/greenstar-terrain.jpg',quality=76,optimize=True)
scenery.add_frames(frames,items)
objectivesForClearance=[dict(x=u[3],y=u[4])for u in units if u[1]in[15011,15012]]
# Extract rivers/bridges, retain original occupancy for every scenery placement.
ff={};sheets={}
for name in ['xlobjs','xlobjs_water']:
 for key,f in plistlib.load((S/'xlobj'/f'{name}.plist').open('rb'))['frames'].items():ff[key]=(name,f)
 sheets[name]=Image.open(S/'xlobj'/f'{name}.png').convert('RGBA')
props=[];blocks=set();clear=set();baseframes={};rocknames=['prop/5048','prop/5049','prop/5115','prop/5140'];print('base rock',rocknames[:20])
for uid in sorted({u[1]for u in units if u[0]in[4,12]}):
 ud=defs[str(uid)];model=ud.get('xlobj');key='data/xlobj/'+str(model)+'.png'
 if not model:continue
 if key in ff:
  sheet,f=ff[key];q=crop(sheets[sheet],f);sw,sh=nums(f['sourceSize']);ox,oy=nums(f['sourceColorRect'])[:2];ox-=sw/2;oy-=sh/2
 elif (S/'xlobj'/f'{model}.png').exists():q=Image.open(S/'xlobj'/f'{model}.png').convert('RGBA');sw,sh=q.size;ox,oy=-sw/2,-sh/2
 else:continue
 nativeWater=model.startswith('river');bridge='bridge'in model
 frame='greenstar-prop/'+str(uid)
 if nativeWater or bridge:
  frames[frame]=dict(w=q.width,h=q.height,ox=ox,oy=oy);items.append((frame,q))
  if nativeWater:
   maskkey='data/xlobj/'+model+'_mask.png'
   if maskkey in ff:
    maskSheet,mf=ff[maskkey];mq=scenery.bank(crop(sheets[maskSheet],mf));mx,my=nums(mf['sourceColorRect'])[:2];frames[frame+'/shore']=dict(w=mq.width,h=mq.height,ox=mx-sw/2,oy=my-sh/2);items.append((frame+'/shore',mq))
 else:
  # Rock/crystal/mine sprite, authored footprint and placement kept independently.
  choice=('prop/5049'if model.startswith('mountain')else 'prop/5048'if model.startswith('rock')else 'prop/5115'if model.startswith(('gres','plant'))else 'prop/5140');f=copy.deepcopy(a['frames'][choice]);k=1.15 if model.startswith('mountain')else .85 if model.startswith(('plant','rock'))else 1;f.update(ow=f['w']*k,oh=f['h']*k,ox=f['ox']*k,oy=f['oy']*k);baseframes[frame]=f
 bif=S/'xlobj'/f'{model}.bif';raw=bif.read_bytes()if bif.exists()else b''
 for u in units:
  if u[1]!=uid or u[0]not in [4,12]:continue
  if model=='xwj_03' and any(abs(u[3]-v[3])<80 and abs(u[4]-v[4])<80 for v in units if v[1]in[15011,15012]):continue
  if not(nativeWater or bridge):
   props.extend(scenery.cluster(u,model,q,ox,oy,paths,objectivesForClearance));continue
  flip=u[5]==180;cells=[]
  if len(raw)>=1228:
   for xx in range(20):
    for yy in range(20):
     sx=sw//16-xx-1 if flip and xx<sw//16 else xx
     if not 0<=sx<20:continue
     cell=(int((int((u[3]-sw/2)/16)+xx)*16+8)//24,int((int((u[4]-sh/2)/16)+yy)*16+8)//24)
     if not(nativeWater or bridge):
      f=baseframes[frame];cx=(cell[0]*24+12-u[3])*f['ow']/sw+u[3];cy=(cell[1]*24+12-u[4])*f['oh']/sh+u[4];cell=(int(cx//24),int(cy//24))
     if raw[28+sx*20+yy]:blocks.add(cell);cells.append(cell)
     if raw[828+sx*20+yy]:clear.add(cell)
  props.append(dict(frame=frame,x=u[3],y=u[4],w=sw,h=sh,flip=flip,blocks=cells,zOrder=-1500 if nativeWater or bridge else 0,river=nativeWater,model=model))
blocks-=clear
props=scenery.unify_river(props,frames,items,ground.size)
# Same native water sequence used by the wolf campaign: 20 frames at 60ms.
waterPath=S/'terrain/water_ani.plist';waterFrames=plistlib.load(waterPath.open('rb'))['frames'];waterImage=pvr(waterPath.with_suffix('.pvr.ccz'))
for i in range(20):
 f=waterFrames[f'water_{i+1:02}.png'];q=crop(waterImage,f);sw,sh=nums(f['sourceSize']);ox,oy=nums(f['sourceColorRect'])[:2];full=Image.new('RGBA',(sw,sh));full.alpha_composite(q,(ox,oy));q=full.resize((128,128),Image.Resampling.LANCZOS);name='greenstar-water/'+str(i);frames[name]=dict(w=128,h=128,ow=sw,oh=sh,ox=0,oy=0);items.append((name,q))
# Packed native river silhouettes, shore masks, bridges and water animation.
atlas=Image.new('RGBA',(1024,1024));x=y=row=0
for name,q in items:
 if x+q.width>1024:x=0;y+=row+2;row=0
 if y+q.height>1024:
  fname=f'greenstar-atlas-{len(pages)}.png';atlas.quantize(colors=160,method=Image.Quantize.FASTOCTREE).save(R/'assets'/fname,optimize=True);pages.append(fname);atlas=Image.new('RGBA',(1024,1024));x=y=row=0
 atlas.alpha_composite(q,(x,y));frames[name].update(x=x,y=y,page=len(pages));x+=q.width+2;row=max(row,q.height)
fname=f'greenstar-atlas-{len(pages)}.png';atlas.crop((0,0,1024,y+row)).quantize(colors=160,method=Image.Quantize.FASTOCTREE).save(R/'assets'/fname,optimize=True);pages.append(fname)
waves=[[]for _ in range(settings['totalWave'])]
for t in triggers:
 for wi,entries in enumerate(t.get('unitPerWave',[]),t.get('beginWave',1)-1):
  for group in entries:
   f=group.split('|');uid,count=map(int,f[4].split('*'));waves[wi].append(dict(spawn=t['uniqueID'],path=int(f[0]),formation=int(f[1]),nextDelay=int(f[2]),perUnitDelay=int(f[3]),unit=uid,count=count,beginWaveDelay=t['beginWaveDelay'][wi]))
unitTypes={}
for uid in ids:
 ud=copy.deepcopy(defs[str(uid)]);ud={k:ud[k]for k in ['name','model','scale','box','attr']if k in ud};ud['sourceAttr']=copy.deepcopy(ud['attr']);ud['name']=ud['name'].replace('TD-BOSS-','').replace('TD-','');ud['attr']['hp']*=20;ud['attr']['attack'][3]*=10;ud['attr']['attack'][4]*=10;ud['drop']={};unitTypes[str(uid)]=ud
objectives=[dict(x=u[3],y=u[4],hp=40000,maxHp=40000,scale=.45,id=17200,label=('中央矿厂'if u[1]==15011 else '东部矿厂'if u[3]>768 else '西部矿厂'))for u in sorted([u for u in units if u[1]in[15011,15012]],key=lambda u:u[1])]
roadMask=scenery.road_mask((w*64,h*64),paths)
roadCells=''.join('2' if roadMask.crop((x*16,y*16,x*16+16,y*16+16)).getextrema()[1]>0 else '1' for y in range(h*4) for x in range(w*4))
raw=dict(map='world/td_009_jmhj',title='氪石矿脉',flankRoutes=flankRoutes,size=[w*64,h*64],units=units,triggers=triggers,settings=settings,waves=waves,unitTypes=unitTypes,buildTerrain=dict(cellSize=16,cols=w*4,rows=h*4,cells=roadCells),terrainGrid=dict(roadsBaked=True),navigationBounds=dict(left=24,top=24,right=w*64-24,bottom=h*64-24),campaignConfig=dict(id='greenstar',playerStart=points[28],objective=objectives[0],objectives=objectives,spawnIds=[15],caves=False,bossIds=[15004,15008,15009,15013],waveIntervalScale=1,clearWaveDelay=3),art=dict(props=props,blocks=sorted(blocks)))
art=dict(pages=pages,frames=frames,baseFrames=baseframes,groups=groups)
for filename,obj,name in [('greenstar-data.js',raw,'GreenstarData'),('greenstar-art.js',art,'GreenstarArt')]:
 (R/'shared'/filename).write_text('(function(){const data='+json.dumps(obj,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.'+name+'=data;})();')
print('objectives',objectives,'waves',[sum(e['count']for e in v)for v in waves],'pages',pages,'blocks',len(blocks),'bytes',sum((R/'assets'/p).stat().st_size for p in pages))
