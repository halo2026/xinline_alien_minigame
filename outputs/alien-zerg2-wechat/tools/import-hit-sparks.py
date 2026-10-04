"""Native nine-route models, muzzle tables, icons and beam textures. Idempotent."""
from pathlib import Path
import json,re,plistlib,zlib,struct
from PIL import Image
R=Path(__file__).resolve().parents[1]
exec((R/'tools/extract-source.py').read_text().split('M=R/')[0])
p=R/'shared/art-data.js';s=p.read_text();a=json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')]);prov=json.loads((R/'art-provenance.json').read_text())
old=a['pages'][:];a['pages']=[v for v in old if not v.startswith('hit-native-')]
for k in list(a['frames']):
 if old[a['frames'][k]['page']].startswith('hit-native-'):del a['frames'][k]
 else:a['frames'][k]['page']=a['pages'].index(old[a['frames'][k]['page']])
for f in (R/'assets').glob('hit-native-*.png'):f.unlink()
items=[]
helper=(R/'tools/import-tactics.py').read_text();exec(helper[helper.index('def add('):helper.index('for id,e in effects.items():')])

exec(helper[helper.index('def readtab('):helper.index('cards=readtab')])
exec(helper[helper.index('modeltext='):helper.index('fxids=')])
effects=readtab('tabs/tab_effect.lua','_tab_effect',[3254,3213,640,84]);data={'effects':{}}
exec(helper[helper.index('for id,e in effects.items():'):helper.index('# Native tactical tower appearances;')])
a['tactical']['effects'].update(data['effects'])
from PIL import ImageChops
styles={'machine':(3254,(255,205,125)), 'shotgun':(3254,(255,210,145)), 'fire':(3213,(255,72,16)), 'laser':(640,(62,195,255)), 'shrink':(84,(205,65,255))}
original=dict(items)
for style,(effect,color) in styles.items():
 names=[]
 for i,key in enumerate(a['groups']['tacticfx/'+str(effect)]):
  f=a['frames'][key];im=original[key];name='hit-native/'+style+'/'+str(i)
  add(name,ImageChops.multiply(im,Image.new('RGBA',im.size,(*color,255))),f['ox'],f['oy'],'native effect '+str(effect)+'; effect.lua guide impact tint')
  names.append(name)
 a['groups']['hit-native/'+style]=names
 im=Image.open(S/'image/misc/splashlight/mask000.png').convert('RGBA')
 add('hit-light/'+style,ImageChops.multiply(im,Image.new('RGBA',im.size,(*color,255))),-im.width/2,-im.height/2,'image/misc/splashlight/mask000.png')
im=Image.open(S/'image/icon/item/chest_5.png').convert('RGBA');add('loot-chest-native',im,-im.width/2,-im.height/2,'image/icon/item/chest_5.png')
im=Image.open(S/'image/misc/chariotconfig/chip.png').convert('RGBA');add('loot-processing-chip',im,-im.width/2,-im.height/2,'image/misc/chariotconfig/chip.png')
page=None;x=y=rowh=0;idx=0
for name,im in sorted(items,key=lambda q:-q[1].height):
 if x+im.width+2>1024:x=0;y+=rowh+2;rowh=0
 if page is None or y+im.height+2>1024:
  if page is not None:page.save(R/'assets'/dest,optimize=True)
  dest='hit-native-atlas-'+str(idx)+'.png';idx+=1;a['pages'].append(dest);page=Image.new('RGBA',(1024,1024));x=y=rowh=0
 page.paste(im,(x,y));a['frames'][name].update(x=x,y=y,page=len(a['pages'])-1);x+=im.width+2;rowh=max(rowh,im.height)
if page is not None:page.save(R/'assets'/dest,optimize=True)
p.write_text('(function(){const d='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();')
(R/'art-provenance.json').write_text(json.dumps(prov,ensure_ascii=False,indent=2))
print('Imported native hit sparks:',len(items),'frames')
