from pathlib import Path
import json,re,plistlib,shutil
from PIL import Image
R=Path(__file__).resolve().parents[1];S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data/image/unit'
models=[('egg','虫卵',.8,1),('egg2','空心虫卵',.8,1),('nest2','喷毒虫巢Ⅰ',.30,1),('nest3','喷毒虫巢Ⅱ',.32,1),('worm','蠕虫',1.0,8),('zergaerialnest','虫族空中巢穴',.55,2),('nest','母巢房子',.42,1)]
items=[];groups={};frames={};nums=lambda s:list(map(int,re.findall(r'-?\d+',s)))
for i,(stem,label,scale,dirs) in enumerate(models):
 uid=914100+i;g={'dirs':dirs,'anim':{},'intervals':{a:.12 for a in ['stand','walk','attack','skill','dead']}};groups[str(uid)]=g
 for path in [S/(stem+'_world.plist'),S/(stem+'_battle.plist'),S/(stem+'.plist')]:
  if not path.exists():continue
  sheet=Image.open(path.with_suffix('.png')).convert('RGBA')
  for key,f in sorted(plistlib.load(path.open('rb'))['frames'].items()):
   action=key.split('/')[-2];n=int(Path(key).stem);row=n//10000
   if stem=='nest' and (action!='stand' or n!=10000):continue
   if action not in g['intervals'] or (dirs in [1,2] and row!=1):continue
   name=f'insect-nest/{stem}/{action}/{row}/{n%10000}'
   if name in frames:continue
   x,y,w,h=nums(f.get('frame',f.get('textureRect')));rot=f.get('rotated',f.get('textureRotated',False));im=sheet.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
   if rot:im=im.transpose(Image.Transpose.ROTATE_90)
   sw,sh=nums(f.get('sourceSize',f.get('spriteSourceSize')));cx,cy=nums(f['sourceColorRect'])[:2] if 'sourceColorRect' in f else ((sw-w)/2+nums(f['spriteOffset'])[0],(sh-h)/2-nums(f['spriteOffset'])[1]);frames[name]={'w':w,'h':h,'ox':cx-sw*.5,'oy':cy-sh*.5};items.append((name,im));g['anim'].setdefault(action,{}).setdefault(str(row),[]).append(name)
 if 'walk' not in g['anim']:g['anim']['walk']=g['anim']['stand']
 if 'attack' not in g['anim']:g['anim']['attack']=g['anim']['stand']
for i in range(1,5):
 im=Image.open(S.parent.parent/'xlobj'/f'creep_{i:02}.png').convert('RGBA');name=f'insect-creep/{i}';frames[name]={'w':im.width,'h':im.height,'ox':-im.width/2,'oy':-im.height/2};items.append((name,im))
pages=[];atlas=Image.new('RGBA',(1024,1024));x=y=rowh=0
def save():
 file=f'insect-nests-{len(pages)}.png';atlas.crop((0,0,1024,y+rowh)).save(R/'assets'/file,optimize=True);pages.append(file)
for name,im in items:
 if x+im.width>1024:x=0;y+=rowh;rowh=0
 if y+im.height>1024:save();atlas=Image.new('RGBA',(1024,1024));x=y=rowh=0
 atlas.paste(im,(x,y));frames[name].update(x=x,y=y,page=len(pages));x+=im.width+2;rowh=max(rowh,im.height+2)
save()
data={'pages':pages,'frames':frames,'groups':groups};code='(function(){const d='+json.dumps(data,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.InsectNestArt=d;})();\n'
for root in [R,R.parent/'alien-wolf-wechat']:
 (root/'shared/insect-nest-art.js').write_text(code)
 if root!=R:
  for file in pages:shutil.copy2(R/'assets'/file,root/'assets'/file)
 p=root/'shared/bestiary-data.js';s=p.read_text();start=s.index('const data=')+11 if 'const data=' in s else s.index('const d=')+8;b,end=json.JSONDecoder().raw_decode(s[start:]);b['entries']=[e for e in b['entries'] if not e['key'].startswith('species:NEST_')]
 for file in pages:
  if file not in b['pages']:b['pages'].append(file)
 for i,(stem,label,scale,dirs) in enumerate(models):
  uid=914100+i;g=groups[str(uid)];fs={a:[[b['pages'].index(pages[frames[k]['page']]),frames[k]['x'],frames[k]['y'],frames[k]['w'],frames[k]['h']] for k in g['anim'][a].get('1',[])] for a in ['walk','attack']}
  e={'key':f'species:NEST_{stem}:normal','id':uid,'stage':'zerg','name':label,'family':'NEST_'+stem,'air':i==5,'boss':False,'locations':['各战役随机出现'],'frequency':10,'frames':fs,'previewSize':[max(f[j] for seq in fs.values() for f in seq) for j in [3,4]],'trait':'虫族小基地的主体建筑，破坏后会留下菌毯和仍存活的孵化体。' if i==6 else '可击碎的虫族孵化容器，破坏后掉落少量随机奖励。' if i<4 else '孵化后在附近蠕动，聚集五只后集群进攻矿厂。' if i==4 else '由喷毒虫巢Ⅰ孵化的空中单位，会主动进攻附近矿厂。','attack':'自身不主动攻击，周围虫卵与喷毒虫巢持续孵化守军。' if i==6 else '定期孵化虫族空中巢穴，及时击碎可阻止后续孵化。' if i==2 else '定期孵化蠕虫，及时击碎可阻止后续孵化。' if i<4 else '集群接近矿厂后撕咬攻击。' if i==4 else '飞近矿厂后喷射腐蚀弹。','category':'孵化体' if i<4 else '普通','drop':{'min':3,'guarantee':9,'base':.2},'tier':'normal','worldSize':max(max(f[3],f[4]) for seq in fs.values() for f in seq)*scale};b['entries'].append(e)
 p.write_text(s[:start]+json.dumps(b,separators=(',',':'),ensure_ascii=False)+s[start+end:])
print('native frames',len(frames),'pages',len(pages),'bytes',sum((R/'assets'/f).stat().st_size for f in pages))
