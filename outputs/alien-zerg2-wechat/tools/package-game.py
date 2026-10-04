"""Build a WeChat Mini Game entry using the same battle code and original assets."""
from pathlib import Path
import json,shutil
from datetime import datetime
from zoneinfo import ZoneInfo
R=Path(__file__).resolve().parents[1]; G=R/'minigame';G.mkdir(exist_ok=True)
import runpy
runpy.run_path(str(R/'tools/sync-campaigns.py'),run_name='__main__')
for old in G.glob('assets[0-9]*'):
 if old.is_dir():shutil.rmtree(old)
# Stamp the package, not the player's launch time. Browser and Mini Game share it.
built_at=datetime.now(ZoneInfo('Asia/Shanghai'))
build_info={'label':built_at.strftime('%m%d-%H:%M'),'builtAt':built_at.isoformat(timespec='seconds'),'timezone':'Asia/Shanghai'}
(R/'shared/build-info.js').write_text('(function(){const info='+json.dumps(build_info)+';if(typeof module!=="undefined")module.exports=info;else globalThis.AlienBuild=info;})();\n')
shutil.copytree(R/'shared',G/'shared',dirs_exist_ok=True)
packages=[];mapping={};size=0;idx=0
for f in sorted((R/'assets').iterdir()):
 if f.name=='on-foot.png':continue
 if f.suffix not in ('.png','.jpg','.wav','.mp3'):continue
 if f.name in ('launch-cover.jpg','loading-dropship.png'):
  shutil.copy2(f,G/f.name);continue
 if not idx or size+f.stat().st_size>2000000:
  idx+=1;size=0;root='assets'+str(idx);dest=G/root;dest.mkdir(exist_ok=True);(dest/'game.js').write_text('');packages.append({'name':root,'root':root})
 shutil.copy2(f,dest/f.name);mapping[f.name]=root+'/'+f.name;size+=f.stat().st_size
# Data-only campaign code is loaded after its subpackage, keeping the main package below 2 MiB.
code=G/'defense-code';code.mkdir(exist_ok=True);(code/'game.js').write_text('')
for name in ['mail-monsters.js','mail-monsters-art.js','insect-nests.js','insect-nest-art.js','tank-mantis.js','tank-mantis-art.js','equipment-fusion.js','zerg4-boss.js','zerg4-boss-art.js','fish3-runtime.js','zerg1-runtime.js','bestiary.js','bestiary-data.js','greenstar-data.js','greenstar-art.js','greenstar-runtime.js','zerg1-data.js','cloud-save.js','defense-art.js',*[cid+'-data.js' for cid in ['snake3','fish3','airship3','fortress2','scorpion2']]]:
 shutil.move(str(G/'shared'/name),str(code/name))
(G/'shared/zerg1-data.js').write_text("module.exports=require('../defense-code/zerg1-data');\n")
for name in ['mail-monsters','mail-monsters-art','insect-nests','insect-nest-art','tank-mantis','tank-mantis-art','equipment-fusion','zerg4-boss','zerg4-boss-art','fish3-runtime','zerg1-runtime','bestiary','bestiary-data','defense-art','greenstar-data','greenstar-art','greenstar-runtime']:(G/'shared'/(name+'.js')).write_text("module.exports=require('../defense-code/"+name+"');\n")
packages.append({'name':'defense-code','root':'defense-code'})
(G/'game.json').write_text(json.dumps({'deviceOrientation':'portrait','showStatusBar':False,'subpackages':packages},indent=2))
(G/'shared/game-assets.js').write_text('module.exports='+json.dumps({'packages':packages,'files':mapping})+';')
p=R/'project.config.json';d=json.loads(p.read_text());d.update({'compileType':'game','miniprogramRoot':'minigame/'});p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
report={'packages':{p['root']:sum(f.stat().st_size for f in (G/p['root']).rglob('*') if f.is_file()) for p in packages},'total':sum(f.stat().st_size for f in G.rglob('*') if f.is_file())}
report['main']=report['total']-sum(report['packages'].values())
assert max(report['packages'].values())<2*1024*1024,report
assert report['main']<2*1024*1024,report
# WeChat Mini Game total-package limit is 30 MiB; keep our conservative 2 MiB per-package split.
assert report['total']<30*1024*1024,report
(R/'game-package-report.json').write_text(json.dumps(report,indent=2))
print('Mini Game packages:',len(packages),'total:',report['total'],'main:',report['main'])
