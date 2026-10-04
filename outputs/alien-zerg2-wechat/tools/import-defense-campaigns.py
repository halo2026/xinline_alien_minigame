"""Import five native defense campaigns; share model atlases without substituting enemies."""
from pathlib import Path
import json,re,struct,plistlib,math
from PIL import Image,ImageChops,ImageStat,ImageDraw
from fortress_material import render as render_fortress_material
R=Path(__file__).resolve().parents[1]
parser=(R/'tools/extract-source.py').read_text();exec(parser[parser.index('from lupa'):parser.index('M=R/')].replace('R=Path(__file__).resolve().parents[1]','R=R'))
source=clean((S/'tabs/tab_unit.lua').read_text());modelsrc=clean((S/'tabs/model/tab_model_unit.lua').read_text());cache={}
def unit(uid):
 if uid not in cache:
  hit=list(re.finditer(r'_tab_unit\['+str(uid)+r'\]\s*=',source))[-1];raw=native(lua.eval(table(source,hit.end())));cache[uid]={k:raw[k] for k in ['name','model','xlobj','scale','box','attr','drop','zOrder'] if k in raw}
 return cache[uid]
configs=[('snake3','yxys_snake_03','双头蛇窟Ⅲ',16013,17000),('fish3','yxys_fish_03','母巢护卫Ⅲ',12983,12983),('airship3','yxys_airship_03','母舰Ⅲ',11623,17200),('fortress2','yxys_mechanics_002','空中堡垒Ⅱ',11699,17200),('scorpion2','yxys_scorpion_02','地狱魔蝎Ⅱ',13216,13216)]
allmaps={};models={};frames={};groups={};items=[];sheets={};plists={}
baseart=json.loads((R/'shared/art-data.js').read_text().split('const data=',1)[1].split(';if(',1)[0]) if False else None
# Crop packed sprites with their authored source anchors. Density retains world size.
def crop(p,k,n,ax=.5,ay=.5,density=1):
 if p not in plists:plists[p]=plistlib.load(p.open('rb'))['frames'];sheets[p]=Image.open(p.with_suffix('.png')).convert('RGBA')
 f=plists[p][k];nums=lambda s:list(map(int,re.findall(r'-?\d+',s)));x,y,w,h=nums(f.get('frame',f.get('textureRect')));rot=f.get('rotated',f.get('textureRotated',False));im=sheets[p].crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:im=im.transpose(Image.Transpose.ROTATE_90)
 sw,sh=nums(f.get('sourceSize',f.get('spriteSourceSize')));cx,cy=nums(f['sourceColorRect'])[:2] if 'sourceColorRect' in f else ((sw-w)/2+nums(f['spriteOffset'])[0],(sh-h)/2-nums(f['spriteOffset'])[1]);ow,oh=im.size
 if density!=1:im=im.resize((max(1,round(ow*density)),max(1,round(oh*density))),Image.Resampling.LANCZOS)
 frames[n]=dict(w=im.width,h=im.height,ow=ow,oh=oh,ox=cx-sw*ax,oy=cy-sh*ay);items.append((n,im));return sw,sh
for cid,name,title,proxy,targetid in configs:
 lua.execute((S/'map/world'/f'{name}.dat').read_text());units=native(lua.globals().units_list);triggers=native(lua.globals().units_data);settings=next(t for t in triggers if t.get('totalWave'));points={u[6]:{'x':u[3],'y':u[4]} for u in units if u[0]==11};player=points[next(t['uniqueID'] for t in triggers if t.get('pointType')==2)];waves=[[] for _ in range(settings['totalWave'])];events=[];objective=None;spawnids=set();ids=set();chests=[]
 for t in triggers:
  begin=t.get('beginWave',1)-1
  for row,entries in enumerate(t.get('unitPerWave',[])):
   wave=begin+row
   if wave>=len(waves):continue
   delays=t.get('beginWaveDelay',[0]);delay=delays[min(row,len(delays)-1)] if delays else 0
   for group in entries:
    f=group.split('|');uid,count,*team=map(int,f[4].split('*'));path=abs(int(f[0]));ud=unit(uid)
    if uid==proxy:objective={**points[t['uniqueID']],'id':targetid,'hp':unit(targetid)['attr']['hp'],'scale':unit(targetid).get('scale',1)};continue
    if path==0:
     if '箱子' in ud.get('name',''):chests.append(dict(wave=wave+1,id=12542,**points[t['uniqueID']]))
     continue
    ids.add(uid);spawnids.add(t['uniqueID']);waves[wave].append(dict(spawn=t['uniqueID'],path=path,formation=int(f[1]),nextDelay=int(f[2]),perUnitDelay=int(f[3]),unit=uid,count=count,beginWaveDelay=delay))
 assert objective,name
 if cid=='fish3':ids.update([12984,12985,12986,12987])
 # Exact native terrain and collision mask, half-resolution color image.
 b=(S/'map/world'/f'{name}.ter').read_bytes();flag,ver,w,h,n,default,_,_=struct.unpack_from('<4h4i',b);tiles=[[(default,15)] for _ in range(w*h)];off=24
 while off<len(b):
  x,y,count=struct.unpack_from('<hhB',b,off);off+=5;ls=[]
  for i in range(count):ls.append(struct.unpack_from('BB',b,off));off+=2
  tiles[y*w+x]=ls
 textures={n:Image.open(S/'terrain'/f't_{(12 if cid=="scorpion2" and n==9 else n):02}.png').convert('RGBA') for ls in tiles for n,a in ls if n};opaque={n:im.getchannel('A').getextrema()[0]==255 for n,im in textures.items()};alpha=Image.open(S/'terrain/alpha01.png').convert('RGBA');ground=Image.new('RGBA',(w*64,h*64));road=Image.new('L',ground.size);corridors=Image.new('L',ground.size)
 for y in range(h):
  for x in range(w):
   for n,a in tiles[y*w+x]:
    if not n:break
    if not a:continue
    tex=textures[n];tw,th=tex.size;tx,ty=((256+x%4*64,y%4*64) if a==15 else (a%4*64,a//4*64)) if tw==512 else (x%(tw//64)*64,y%(th//64)*64);im=tex.crop((tx,ty,tx+64,ty+64))
    if a!=15 and tw!=512:im.putalpha(ImageChops.multiply(im.getchannel('A'),alpha.crop((((a-1)%4)*64,((a-1)//4)*64,((a-1)%4+1)*64,((a-1)//4+1)*64)).getchannel('A')))
    ground.alpha_composite(im,(x*64,y*64))
    if cid=='fortress2' and n==11:
     mask=Image.new('L',(64,64),255) if a==15 else alpha.crop((((a-1)%4)*64,((a-1)//4)*64,((a-1)%4+1)*64,((a-1)//4+1)*64)).getchannel('A');corridors.paste(mask,(x*64,y*64));road.paste(mask,(x*64,y*64))
    if n==6:road.paste(im.getchannel('A'),(x*64,y*64))
 landalpha=ImageChops.lighter(ground.getchannel('A'),corridors);cells=[]
 for y in range(h*4):
  for x in range(w*4):
   box=(x*16,y*16,x*16+16,y*16+16);land=ImageStat.Stat(landalpha.crop(box)).mean[0];rv=ImageStat.Stat(road.crop(box)).mean[0];cells.append('0' if land<128 else '2' if rv>=90 else '1')
 # Preserve authored surface decals directly in terrain; rocks remain depth sorted.
 props=[];blocks=set();pf=S/'xlobj/xlobjs.plist';pfkeys=plistlib.load(pf.open('rb'))['frames']
 for uid in sorted(set(u[1] for u in units if u[0] in [4,12])):
  ud=unit(uid);model=ud.get('xlobj');key=f'data/xlobj/{model}.png';frame='campaign-prop/'+str(uid)
  if not model or model=='ditai2':continue  # Retired pet recruitment pedestal: omit visual and collision.
  if frame not in frames:
   if key in pfkeys:sw,sh=crop(pf,key,frame,density=1)
   elif (S/'xlobj'/f'{model}.png').exists():
    im=Image.open(S/'xlobj'/f'{model}.png').convert('RGBA');sw,sh=im.size;frames[frame]=dict(w=sw,h=sh,ow=sw,oh=sh,ox=-sw/2,oy=-sh/2);items.append((frame,im))
   else:continue
  else:sw,sh=map(int,re.findall(r'\d+',pfkeys[key].get('sourceSize',pfkeys[key].get('spriteSourceSize')))) if key in pfkeys else (frames[frame]['ow'],frames[frame]['oh'])
  data=(S/'xlobj'/f'{model}.bif').read_bytes() if (S/'xlobj'/f'{model}.bif').exists() else b''
  for u in units:
   if u[0] not in [4,12] or u[1]!=uid:continue
   prop=dict(frame=frame,x=u[3],y=u[4],w=sw,h=sh,zOrder=ud.get('zOrder',0),flip=bool(u[5]),blocks=[])
   if u[0]==12:
    im=next(im for n,im in items if n==frame);f=frames[frame];ox=f['ox'];im=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if u[5] else im;ox=-ox-im.width if u[5] else ox;ground.alpha_composite(im,(int(u[3]+ox),int(u[4]+f['oy'])));continue
   for x in range(20):
    for y in range(20):
     if len(data)>=1228 and data[28+x*20+y]:
      cell=(int((int((u[3]-sw/2)/16)+(int(sw/16)-1-x if u[5] else x))*16+8)//24,int((int((u[4]-sh/2)/16)+y)*16+8)//24);blocks.add(cell);prop['blocks'].append(cell)
   props.append(prop)
 if cid=='fortress2':
  # Native road waypoints bridge seams in the semitransparent blue floor tiles.
  brush=ImageDraw.Draw(corridors);roadbrush=ImageDraw.Draw(road)
  for route in settings['pathList']:
   poly=[(points[i]['x'],points[i]['y']) for i in route];brush.line(poly,fill=255,width=40);roadbrush.line(poly,fill=255,width=40)
 # Surface decals are the authored floor on the fish/airship/mechanics maps.
 landalpha=ImageChops.lighter(ground.getchannel('A'),corridors);cells=[]
 for y in range(h*4):
  for x in range(w*4):
   box=(x*16,y*16,x*16+16,y*16+16);land=ImageStat.Stat(landalpha.crop(box)).mean[0];rv=ImageStat.Stat(road.crop(box)).mean[0];cells.append('0' if land<128 else '2' if rv>=90 else '1')
 if cid=='fortress2':ground=render_fortress_material(tiles,w,h,S)
 ground.resize((w*32,h*32),Image.Resampling.LANCZOS).quantize(colors=192,method=Image.Quantize.FASTOCTREE).save(R/'assets'/f'{cid}-terrain.png',optimize=True)
 defs={str(i):unit(i) for i in ids};bossids=[i for i in ids if unit(i)['attr'].get('hp',0)>=100000];config=dict(id=cid,playerStart=player,objective=objective,spawnIds=sorted(spawnids),caves=cid in ['snake3','scorpion2'],bossIds=bossids,chests=chests,waveIntervalScale=.5,clearWaveDelay=3)
 for i,d in defs.items():models.setdefault(d['model'],[]).append(i)
 allmaps[cid]=dict(map='world/'+name,title=title,size=[w*64,h*64],units=units,triggers=triggers,settings=settings,waves=waves,unitTypes=defs,buildTerrain=dict(cellSize=16,cols=w*4,rows=h*4,cells=''.join(cells)),terrainGrid=dict(roadsBaked=True),navigationBounds=dict(left=24,top=24,right=w*64-24,bottom=h*64-24),campaignConfig=config,art=dict(props=props,blocks=sorted(blocks)))
 if cid=='fortress2':
  # Glass floor transparency is visual only. Its authored terrain tile is walkable.
  allmaps[cid]['navigationTerrain']=dict(cellSize=64,cols=w,rows=h,cells=''.join('1' if any(t in [11,12] and a for t,a in ls) else '0' for ls in tiles))
 print(cid,len(waves),'waves',len(ids),'enemies',objective,flush=True)
# Shared enemy art, original animation sequences and direction rows.
for model,ids in models.items():
 line=next((l for l in modelsrc.splitlines() if '"'+model+'"' in l),None);assert line,model
 match=re.search(r'"unit/([^"/]+)\.plist"',line);assert match,line
 stem=match[1];anchor=re.search(r'\{(0\.\d+),(0\.\d+)\}',line);ax,ay=map(float,anchor.groups()) if anchor else (.5,.5)
 direction=re.search(r'Dx(\d+)',line);dirs=int(direction[1]) if direction else 8
 paths=[p for p in [S/'image/unit'/f'{stem}_world.plist',S/'image/unit'/f'{stem}_battle.plist'] if p.exists()]
 if not paths:paths=[S/'image/unit'/f'{stem}.plist']
 group=dict(dirs=dirs,anim={},intervals={a:.12 for a in ['stand','walk','attack','skill','dead']})
 for p in paths:
  keys=plistlib.load(p.open('rb'))['frames']
  for k in sorted(keys):
   parts=k.split('/');action=parts[-2] if len(parts)>1 else '';num=re.search(r'(\d+)\.png$',k)
   if action not in ['stand','walk','attack','skill','dead'] or not num:continue
   row=int(num[1])//10000;idx=int(num[1])%10000;n='campaign-unit/'+stem+'/'+action+'/'+str(row)+'/'+str(idx)
   if n in frames:continue
   crop(p,k,n,ax,ay,1 if stem=='metal_balloon2' else .65);group['anim'].setdefault(action,{}).setdefault(str(row),[]).append(n)
 assert group['anim'],(model,paths)
 for uid in ids:groups[uid]=group
 print(model,'frames',sum(len(f) for a in group['anim'].values() for f in a.values()),flush=True)
# Pack atlas pages and write records.
pages=[];atlas=Image.new('RGBA',(1024,1024));x=y=rowh=0
for n,im in items:
 if x+im.width>1024:x=0;y+=rowh;rowh=0
 if y+im.height>1024:
  filename=f'campaign-atlas-{len(pages)}.png';atlas.quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets'/filename,optimize=True);pages.append(filename);atlas=Image.new('RGBA',(1024,1024));x=y=rowh=0
 assert im.width<=1024 and im.height<=1024
 atlas.alpha_composite(im,(x,y));frames[n].update(page=len(pages),x=x,y=y);x+=im.width+2;rowh=max(rowh,im.height+2)
filename=f'campaign-atlas-{len(pages)}.png';atlas.crop((0,0,1024,y+rowh)).quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets'/filename,optimize=True);pages.append(filename)
# Compact JSON and share repeated animation group objects by model.
unique={};aliases={}
for uid,g in groups.items():
 key=next((k for k,v in unique.items() if v is g),None)
 if key:aliases[uid]=key
 else:unique[uid]=g
art=dict(pages=pages,frames=frames,groups=unique,aliases=aliases)
def write(file,data,glob):
 (R/'shared'/file).write_text('(function(){const data='+json.dumps(data,separators=(',',':'),ensure_ascii=False)+';if(typeof module!=="undefined")module.exports=data;else globalThis.'+glob+'=data;})();')
write('defense-art.js',art,'DefenseArt')
for cid,data in allmaps.items():write(cid+'-data.js',data,'Defense_'+cid)
print('Completed',len(pages),'atlas pages',len(frames),'frames')
