"""Import native tactical config and unmodified sprite cells; no guessed icon assets."""
from pathlib import Path
import json,re,plistlib,shutil,zlib,struct
from PIL import Image
from lupa import LuaRuntime,lua_type
R=Path(__file__).resolve().parents[1];S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data'
# Share the Lua table parser without running the map exporter.
exec((R/'tools/extract-source.py').read_text().split('M=R/')[0])
def readtab(file,prefix,ids):
 s=clean((S/file).read_text());out={}
 for id in ids:
  hits=list(re.finditer(re.escape(prefix+'['+str(id)+']')+r'\s*=',s))
  if hits:out[str(id)]=native(lua.eval(table(s,hits[-1].end())))
 return out
cards=readtab('tabs/tab_item.lua','_tab_item',range(12013,12026))
cards[12013]['name']='道具技能-巡航导弹'
for c in cards.values():c['activeSkill']['costMana']=[7]*40
units=readtab('tabs/tab_unit.lua','_tab_unit',[19004,19005,19025])
mp=clean((S/'tabs/tab_map.lua').read_text());pos=mp.index('hVar.MAP_INFO["world/yxys_zerg_002"]');pools=native(lua.eval(table(mp,pos)))['publicDrop']
data={'cards':cards,'units':units,'dropPools':pools}
p=R/'shared/art-data.js';s=p.read_text();a=json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')]);prov=json.loads((R/'art-provenance.json').read_text())
modeltext=clean((S/'tabs/model/tab_model_effect.lua').read_text());models={}
for m in re.finditer(r'_tab_model\[\d+\]\s*=',modeltext):
 try:
  t=native(lua.eval(table(modeltext,m.end())))
  if isinstance(t,dict):models[t.get('name')]=t
 except Exception:pass
fxids=[471,541,595,3023,3063,3097,3106,3164,3166,3169,3177,3179,3190,3192,3193,3196,3214,3239,3451]
effects=readtab('tabs/tab_effect.lua','_tab_effect',fxids);data['effects']={}
old=a['pages'][:];a['pages']=[v for v in old if not v.startswith('tactic-')]
for k in list(a['frames']):
 if k.startswith(('tacticfx/','tactower/')):del a['frames'][k]
 else:a['frames'][k]['page']=a['pages'].index(old[a['frames'][k]['page']])
for p0 in (R/'assets').glob('tactic-*.png'):p0.unlink()
items=[]
def add(name,im,ox,oy,source):
 a['frames'][name]={'w':im.width,'h':im.height,'ox':ox,'oy':oy};items.append((name,im))
 if not any(v['frame']==name for v in prov):prov.append({'frame':name,'source':source})
def texture(pp):
 png=pp.with_suffix('.png')
 if png.exists():return Image.open(png).convert('RGBA')
 raw=zlib.decompress(pp.with_suffix('.pvr.ccz').read_bytes()[16:]);head=struct.unpack('<13I',raw[:52]);assert head[6]==32 and head[0]==52
 return Image.frombytes('RGBA',(head[2],head[1]),raw[52:52+head[2]*head[1]*4])
for id,e in effects.items():
 m=models.get(e['model']);
 if not m:print('Missing model',id,e);continue
 anim=m.get('stand',{});ax,ay=anim.get('anchor',[.5,.5]);names=[]
 if m.get('plist'):
  pp=S/'image'/m['plist'];pf=plistlib.load(pp.open('rb'))['frames'];atlas=texture(pp);nums=lambda s:list(map(int,re.findall(r'-?\d+',s)))
  for k,f in sorted(pf.items(),key=lambda kv:[int(v) if v.isdigit() else v for v in re.split(r'(\d+)',kv[0])]):
   if not Path(k).stem.startswith(anim.get('pName','')):continue
   x,y,w,h=nums(f.get('frame',f.get('textureRect')));rot=f.get('rotated',f.get('textureRotated',False));im=atlas.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
   if rot:im=im.transpose(Image.Transpose.ROTATE_90)
   sw,sh=nums(f.get('sourceSize',f.get('spriteSourceSize')));cx,cy=nums(f['sourceColorRect'])[:2] if 'sourceColorRect' in f else ((sw-w)/2+nums(f['spriteOffset'])[0],(sh-h)/2-nums(f['spriteOffset'])[1]);n='tacticfx/'+id+'/'+str(len(names));add(n,im,cx-sw*ax,cy-sh*ay,str(pp.relative_to(S)));names.append(n)
 else:
  file=S/'image'/m['image'];im=Image.open(file).convert('RGBA')
  row=anim.get('1')
  if not row:print('Missing row',id);continue
  # Sprite rows are directions when there are multiple rows; choose the first.
  x,y,w,h,*rest=row;count=rest[0] if rest else 1
  for i in range(count):
   n='tacticfx/'+id+'/'+str(i);add(n,im.crop((x+i*w,y,x+(i+1)*w,y+h)),-w*ax,-h*ay,str(file.relative_to(S)));names.append(n)
 a['groups']['tacticfx/'+id]=names;data['effects'][id]={'scale':e.get('scale',1),'interval':anim.get('interval',100)/1000,'frames':len(names)}
# Native tactical tower appearances; preserve direction rows and trim offsets.
for uid,model,dirs,anchor in [(19004,'jeepgun25',32,.45),(19005,'tdpaota3',8,.5)]:
 role='tactower/'+str(uid);group={'dirs':dirs,'anim':{},'intervals':{'stand':.12,'attack':.12}}
 paths=[S/'image/unit'/(model+'.plist')] if dirs==32 else [S/'image/unit'/(model+'_world.plist'),S/'image/unit'/(model+'_battle.plist')]
 for pp in paths:
  if not pp.exists():continue
  pf=plistlib.load(pp.open('rb'))['frames'];atlas=texture(pp);nums=lambda t:list(map(int,re.findall(r'-?\d+',t)))
  for k,f in sorted(pf.items()):
   action=k.split('/')[-2]
   if action not in ['stand','attack']:continue
   row=int(Path(k).stem)//10000;x,y,w,h=nums(f.get('frame',f.get('textureRect')));rot=f.get('rotated',f.get('textureRotated',False));im=atlas.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
   if rot:im=im.transpose(Image.Transpose.ROTATE_90)
   sw,sh=nums(f.get('sourceSize',f.get('spriteSourceSize')));cx,cy=nums(f['sourceColorRect'])[:2] if 'sourceColorRect' in f else ((sw-w)/2+nums(f['spriteOffset'])[0],(sh-h)/2-nums(f['spriteOffset'])[1]);name=role+'/'+action+'/'+str(row)+'/'+str(len(items));add(name,im,cx-sw*.5,cy-sh*anchor,str(pp.relative_to(S)));group['anim'].setdefault(action,{}).setdefault(str(row),[]).append(name)
 a['groups'][role]=group
# One or more tightly packed atlases instead of a subpackage per animation cell.
page=None;x=y=rowh=0;idx=0
for name,im in sorted(items,key=lambda q:-q[1].height):
 if x+im.width+2>1024:x=0;y+=rowh+2;rowh=0
 if page is None or y+im.height+2>1024:
  if page is not None:page.save(R/'assets'/dest,optimize=True)
  dest='tactic-atlas-'+str(idx)+'.png';idx+=1;a['pages'].append(dest);page=Image.new('RGBA',(1024,1024));x=y=rowh=0
 page.paste(im,(x,y));a['frames'][name].update(x=x,y=y,page=len(a['pages'])-1);x+=im.width+2;rowh=max(rowh,im.height)
if page is not None:page.save(R/'assets'/dest,optimize=True)
a['tactical']=data
p.write_text('(function(){const d='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();')
(R/'art-provenance.json').write_text(json.dumps(prov,ensure_ascii=False,indent=2))
(R/'tactical-source.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
for sound in ['a_bomb.wav','magic3.wav','magic14.wav','shot10.wav']:shutil.copyfile(S/'sound'/sound,R/'assets'/sound)
print('Imported',len(data['effects']),'native effects and',len(cards),'cards')
