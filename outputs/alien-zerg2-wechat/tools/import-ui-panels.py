from pathlib import Path
import json,struct,shutil,re
r=Path(__file__).resolve().parents[1];src=r.parent/'alien-mac/source/XLFramework/Projects/alien_source/data'
p=r/'shared/art-data.js';s=p.read_text();a=json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')]);prov=json.loads((r/'art-provenance.json').read_text())
# Drop unused prototype panels and remap atlas page indices.
old_pages=a['pages'][:]
a['pages']=[v for v in old_pages if v not in ['ui-frame.png','ui-panel.png']]
for key in ['ui-frame','ui-panel']:
 a['frames'].pop(key,None)
 (r/'assets'/(key+'.png')).unlink(missing_ok=True)
for f in a['frames'].values():f['page']=a['pages'].index(old_pages[f['page']])
prov=[v for v in prov if v['frame'] not in ['ui-frame','ui-panel']]
hud=[('hud-'+n,'misc/hpbar/'+f+'.png') for n,f in [('hp-back','img_bar_playerHealth_0'),('hp','img_bar_playerHealth_4'),('energy','img_bar_playerpower_1'),('level','di_dengji_on')]]+[('hud-heart','misc/uiHero/icon_heart.png'),('hud-power','misc/uiHero/icon_power.png')]
hud += [('kryptonite','misc/skillup/keshi.png'),('hud-original-panel','misc/uiHero/di_underlevel.png'),('hud-native-green','misc/uiHero/bar_green.png'),('hud-native-gold','misc/uiHero/bar_yellow.png'),('hud-level-glow','misc/uiHero/btn_autofire_on.png'),('grenade-frame','icon/skill/icon4.png'),('grenade-ready','icon/skill/icon4_full.png'),('grenade-icon','icon/skill/l5.png'),('grenade-single','icon/skill/l4.png')]
for name,file in hud+[('ui-info','misc/chariotconfig/new/di_skillupinfo.png'),('equip-frame','misc/chariotconfig/new/di_Item_level_1.png'),('equip-empty','misc/chariotconfig/new/btn_upgrade_addItem.png')]+[('equip-quality-'+str(i),'misc/chariotconfig/equipbg_'+color+'.png') for i,color in enumerate(['white','blue','yellow','orange','red'],1)]:
 source=src/'image'/file;dest=name+'.png';shutil.copyfile(source,r/'assets'/dest);w,h=struct.unpack('>II',source.read_bytes()[16:24]);
 if dest not in a['pages']:a['pages'].append(dest)
 a['frames'][name]={'w':w,'h':h,'ox':0,'oy':0,'x':0,'y':0,'page':a['pages'].index(dest)}
 if not any(i['frame']==name for i in prov):prov.append({'frame':name,'source':'image/'+file})
# Resolve original Lua rarity enums; generic Lua stubs lose these numeric values.
items=(src/'tabs/tab_item.lua').read_text()
quality={'WHITE':1,'BLUE':2,'GOLD':3,'RED':4,'ORANGE':5}
a['equipmentQualities']={m[1]:quality[m[2]] for m in re.finditer(r'_tab_item\[(\d+)\]\s*=\s*\{(?:(?!_tab_item\[).)*?itemLv\s*=\s*hVar.ITEM_QUALITY\.(WHITE|BLUE|GOLD|RED|ORANGE)',items,re.S)}
p.write_text('(function(){const d='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();')
(r/'art-provenance.json').write_text(json.dumps(prov,ensure_ascii=False,indent=2))
