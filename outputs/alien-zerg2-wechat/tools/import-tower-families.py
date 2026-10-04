"""Native nine-route models, muzzle tables, icons and beam textures. Idempotent."""
from pathlib import Path
import json,re,plistlib,zlib,struct
from PIL import Image
R=Path(__file__).resolve().parents[1]
exec((R/'tools/extract-source.py').read_text().split('M=R/')[0])
p=R/'shared/art-data.js';s=p.read_text();a=json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')]);prov=json.loads((R/'art-provenance.json').read_text())
old=a['pages'][:];a['pages']=[v for v in old if not v.startswith('family-')]
for k in list(a['frames']):
 if old[a['frames'][k]['page']].startswith('family-'):del a['frames'][k]
 else:a['frames'][k]['page']=a['pages'].index(old[a['frames'][k]['page']])
for f in (R/'assets').glob('family-*.png'):f.unlink()
items=[]
helper=(R/'tools/import-tactics.py').read_text();exec(helper[helper.index('def add('):helper.index('for id,e in effects.items():')])
units={};src=clean((S/'tabs/tab_unit.lua').read_text());models=(S/'tabs/model/tab_model_unit.lua').read_text()
for uid in [6013,6014,6008,6003,6024,6006,6004,6017,6005,6007,6022]:
 m=list(re.finditer(r'_tab_unit\['+str(uid)+r'\]\s*=',src))[-1];u=native(lua.eval(table(src,m.end())));units[str(uid)]={'bullet':u.get('bullet',{'num':8,**{str(i*45):{'offsetX':0,'offsetY':25} for i in range(8)}}),'model':u['model'],'icon':u['icon']}
 model=re.search(r'HMDx32P2PIC\("'+re.escape(u['model'])+r'","([^"]+)"',models).group(1)
 # Reuse already packed full native models when they match exactly.
 reuse={6013:'normalgun',6014:'shotgun',6003:'flamegun',6006:'gun'}
 if uid in reuse:role=reuse[uid];units[str(uid)]['role']=role;units[str(uid)]['renderScale']=.7
 else:
  role='family/'+str(uid);units[str(uid)]['role']=role;units[str(uid)]['renderScale']=1.4
  pp=S/'image'/model;pf=plistlib.load(pp.open('rb'))['frames'];atlas=texture(pp);nums=lambda t:list(map(int,re.findall(r'-?\d+',t)));group={'dirs':32,'anim':{},'intervals':{'stand':.12,'attack':.12}}
  for k,f in sorted(pf.items()):
   action=k.split('/')[-2]
   if action not in ['stand','attack']:continue
   row=int(Path(k).stem)//10000;x,y,w,h=nums(f.get('frame',f.get('textureRect')));rot=f.get('rotated',f.get('textureRotated',False));im=atlas.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
   if rot:im=im.transpose(Image.Transpose.ROTATE_90)
   sw,sh=nums(f.get('sourceSize',f.get('spriteSourceSize')));cx,cy=nums(f['sourceColorRect'])[:2] if 'sourceColorRect' in f else ((sw-w)/2+nums(f['spriteOffset'])[0],(sh-h)/2-nums(f['spriteOffset'])[1]);name=role+'/'+action+'/'+str(row)+'/'+str(len(items));im=im.resize((max(1,round(w/2)),max(1,round(h/2))),Image.Resampling.LANCZOS);add(name,im,(cx-sw*.5)/2,(cy-sh*.45)/2,str(pp.relative_to(S)));group['anim'].setdefault(action,{}).setdefault(str(row),[]).append(name)
  a['groups'][role]=group
 icon=S/'image'/u['icon'];im=Image.open(icon).convert('RGBA');add('familyicon/'+str(uid),im,-im.width/2,-im.height/2,str(icon.relative_to(S)))
for key,file in [('chain','chain_005.png'),('shrink','daoguang04.png')]:
 f=S/'image/effect'/file;im=Image.open(f).convert('RGBA');add('familybeam/'+key,im,-im.width/2,-im.height/2,str(f.relative_to(S)))
# Import original projectile and contact-effect cells through the same extractor.
exec(helper[helper.index('def readtab('):helper.index('cards=readtab')])
exec(helper[helper.index('modeltext='):helper.index('fxids=')])
effects=readtab('tabs/tab_effect.lua','_tab_effect',[598,3241,3075,3076,448,3406,3452,3511]);data={'effects':{}}
exec(helper[helper.index('for id,e in effects.items():'):helper.index('# Native tactical tower appearances;')])
a['tactical']['effects'].update(data['effects'])
page=None;x=y=rowh=0;idx=0
for name,im in sorted(items,key=lambda q:-q[1].height):
 if x+im.width+2>1024:x=0;y+=rowh+2;rowh=0
 if page is None or y+im.height+2>1024:
  if page is not None:page.quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets'/dest,optimize=True)
  dest='family-atlas-'+str(idx)+'.png';idx+=1;a['pages'].append(dest);page=Image.new('RGBA',(1024,1024));x=y=rowh=0
 page.paste(im,(x,y));a['frames'][name].update(x=x,y=y,page=len(a['pages'])-1);x+=im.width+2;rowh=max(rowh,im.height)
if page is not None:page.quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(R/'assets'/dest,optimize=True)
a['towerUnits']=units;a['frames']['towericon/12204']=dict(a['frames']['familyicon/6004'])
p.write_text('(function(){const d='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();')
(R/'art-provenance.json').write_text(json.dumps(prov,ensure_ascii=False,indent=2))
print('Imported nine native weapon identities;',len(items),'frames;',idx,'atlases')
