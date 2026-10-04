"""Build a WeChat Mini Game entry using the same battle code and original assets."""
from pathlib import Path
import json,shutil
R=Path(__file__).resolve().parents[1]; G=R/'minigame';G.mkdir(exist_ok=True)
for old in G.glob('assets[0-9]*'):
 if old.is_dir():shutil.rmtree(old)
shutil.copytree(R/'shared',G/'shared',dirs_exist_ok=True)
packages=[];mapping={};size=0;idx=0
for f in sorted((R/'assets').iterdir()):
 if f.suffix not in ('.png','.wav','.mp3'):continue
 if not idx or size+f.stat().st_size>2000000:
  idx+=1;size=0;root='assets'+str(idx);dest=G/root;dest.mkdir(exist_ok=True);(dest/'game.js').write_text('');packages.append({'name':root,'root':root})
 shutil.copy2(f,dest/f.name);mapping[f.name]=root+'/'+f.name;size+=f.stat().st_size
(G/'game.json').write_text(json.dumps({'deviceOrientation':'portrait','showStatusBar':False,'subpackages':packages},indent=2))
(G/'shared/game-assets.js').write_text('module.exports='+json.dumps({'packages':packages,'files':mapping})+';')
p=R/'project.config.json';d=json.loads(p.read_text());d.update({'compileType':'game','miniprogramRoot':'minigame/'});p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
report={'packages':{p['root']:sum(f.stat().st_size for f in (G/p['root']).rglob('*') if f.is_file()) for p in packages},'total':sum(f.stat().st_size for f in G.rglob('*') if f.is_file())}
report['main']=report['total']-sum(report['packages'].values())
assert max(report['packages'].values())<2*1024*1024,report
assert report['main']<2*1024*1024,report
assert report['total']<20*1024*1024,report
(R/'game-package-report.json').write_text(json.dumps(report,indent=2))
print('Mini Game packages:',len(packages),'total:',report['total'],'main:',report['main'])
