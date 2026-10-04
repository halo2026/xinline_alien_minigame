from pathlib import Path
import struct,json
from PIL import Image,ImageStat
R=Path(__file__).resolve().parents[1];S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data';M=R/'source-map';source=(R/'tools/extract-source.py').read_text();exec(source[source.index("b=(M/'yxys_zerg_002.ter')"):source.index('textures=')]);alpha=Image.open(S/'terrain/alpha01.png').convert('RGBA');mask=Image.new('L',(w*64,h*64));exec(source[source.index('for y in range(h):',source.index('# Experimental roadside')):source.index('cells=[]',source.index('# Experimental roadside'))]);cells=[]
for y in range(h*4):
 for x in range(w*4):
  mean=ImageStat.Stat(mask.crop((x*16,y*16,x*16+16,y*16+16))).mean[0];cells.append(2 if mean>=192 else 1 if mean>=96 else 0)
p=R/'shared/level-data.js';s=p.read_text();data=json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')]);old=data['buildTerrain']['cells'];print('Reclassified cells:',sum(a!=b for a,b in zip(old,cells)));data['buildTerrain'].update(cells=cells,classification='mean visual terrain coverage; >=192 road, >=96 roadside');p.write_text('(function(){const d='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergLevel=d;})();')
