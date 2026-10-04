from pathlib import Path
from PIL import Image
import json,plistlib,re,copy
R=Path(__file__).resolve().parents[1];S=R.parent/'cema-reference';base=R.parent/'alien-zerg2-wechat'
def read(p):
 s=p.read_text();return json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')])
def write(p,d,name):p.write_text('(function(){const d='+json.dumps(d,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.'+name+'=d;})();')
n=json.loads((R/'source-map/native-source.json').read_text());d=read(base/'shared/level-data.js');a=read(base/'shared/art-data.js');mapping={14002:12500,14001:12501,14010:12502,14011:12503,14004:12503,14014:12501,14005:12504,14015:12503,15007:12500}
for uid,skin in mapping.items():
 native=n['unitTypes'][str(uid)];obj=copy.deepcopy(d['unitTypes'][str(skin)]);obj['nativeUnit']=uid;obj['skinId']=skin;obj['sourceAttr']=native['attr'];obj['attr']=copy.deepcopy(native['attr']);obj['attr']['hp']*=20;obj['attr']['attack']=[*obj['attr']['attack']];obj['attr']['attack'][3]*=20;obj['attr']['attack'][4]*=20;obj['scale']=.65 if uid!=14005 else .8;obj['drop']={};d['unitTypes'][str(uid)]=obj;a['groups'][str(uid)]=a['groups'][str(skin)]
for k in ['map','title','size','units','triggers','settings','waves','terrainTiles']:d[k]=n[k]
d.pop('strategicRoads',None);d['terrainGrid']={'cellSize':64,'cols':24,'rows':20,'roadsBaked':False};d['navigationBounds']={'left':24,'top':24,'right':1512,'bottom':1256};d['campaign']={'source':'扫除狼患 · 战役剧情','totalLife':10,'bossId':14005,'spawnPoint':n['points']['30'],'exitPoint':n['points']['13'],'towerPads':[{'x':u[3],'y':u[4]}for u in n['units']if u[0]==14],'damageScale':20}
d['buildTerrain']={'cellSize':16,'cols':96,'rows':80,'cells':[1]*7680};Image.open(R/'source-map/native-terrain.png').quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets/terrain.png',optimize=True)
# Native scenery with original placement and BIF occupancy.
frames=plistlib.load((S/'xlobj/xlobjs.plist').open('rb'))['frames'];sheet=Image.open(S/'xlobj/xlobjs.png');a['props']=[];blocks=set();clear_blocks=set();atlas=Image.new('RGBA',(2048,2048));ax=ay=row=0;page=len(a['pages']);a['pages'].append('wolf-scenery.png');nums=lambda st:list(map(int,re.findall(r'-?\d+',st)))
for uid,ud in n['unitTypes'].items():
 model=ud.get('xlobj');placements=[u for u in n['units']if u[0]==4 and u[1]==int(uid)]
 if not model or not placements or model=='gres_village':continue
 key='data/xlobj/'+model+'.png';f=frames.get(key);sourceSheet=sheet
 if not f:
  water=plistlib.load((S/'xlobj/xlobjs_water.plist').open('rb'))['frames'];f=water.get(key)
  if f:sourceSheet=Image.open(S/'xlobj/xlobjs_water.png')
 if f:
  x,y,w,h=nums(f['frame']);rot=f.get('rotated',False);im=sourceSheet.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
  if rot:im=im.transpose(Image.Transpose.ROTATE_90)
  sw,sh=nums(f['sourceSize']);ox,oy=nums(f['sourceColorRect'])[:2];ox-=sw/2;oy-=sh/2
 else:
  im=Image.open(S/'xlobj'/f'{model}.png').convert('RGBA');sw,sh=im.size;ox,oy=-sw/2,-sh/2
 w,h=im.size
 if ax+w>2048:ax=0;ay+=row+2;row=0
 assert ay+h<=2048,(model,ay,h)
 name='wolf-prop/'+uid;a['frames'][name]={'x':ax,'y':ay,'w':w,'h':h,'ox':ox,'oy':oy,'page':page};atlas.paste(im,(ax,ay));ax+=w+2;row=max(row,h)
 bif=S/'xlobj'/f'{model}.bif';b=bif.read_bytes()if bif.exists()else b''
 for u in placements:
  prop={'frame':name,'x':u[3],'y':u[4],'w':sw,'h':sh,'blocks':[],'flip':u[5]==180 and model!='lake02'};a['props'].append(prop)
  if len(b)>=1228:
   for x in range(20):
    for y in range(20):
     sx=sw//16-x-1 if prop['flip'] and x<sw//16 else x
     if not 0<=sx<20:continue
     cell=(int((int((u[3]-sw/2)/16)+x)*16+8)//24,int((int((u[4]-sh/2)/16)+y)*16+8)//24)
     if b[28+sx*20+y]:blocks.add(cell);prop['blocks'].append(cell)
     if b[828+sx*20+y]:clear_blocks.add(cell)
atlas.quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets/wolf-scenery.png',optimize=True);a['blocks']=sorted(blocks-clear_blocks);write(R/'shared/level-data.js',d,'ZergLevel');write(R/'shared/art-data.js',a,'ZergArt');print('props',len(a['props']),'blocks',len(blocks),'skins',mapping)
