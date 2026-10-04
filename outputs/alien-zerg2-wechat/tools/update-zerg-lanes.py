from pathlib import Path
import json,copy
r=Path(__file__).resolve().parents[1]
def read(p):
 s=p.read_text();return json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')])
def write(p,d,name):p.write_text('(function(){const d='+json.dumps(d,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.'+name+'=d;})();')
d=read(r/'shared/level-data.js');a=read(r/'shared/art-data.js')
xy=[[(540,420),(420,588),(468,780),(540,924),(516,1104),(540,1260),(612,1404),(744,1500)],[(540,420),(684,564),(660,780),(636,924),(660,1104),(612,1260),(612,1404),(744,1500)],[(1284,420),(1116,564),(1140,780),(1164,924),(1140,1104),(1188,1260),(1188,1404),(1056,1500)],[(1284,420),(1428,588),(1380,780),(1260,924),(1284,1104),(1260,1260),(1188,1404),(1056,1500)]]
d['strategicRoads']['routes']=[[dict(x=x,y=y) for x,y in route]for route in xy]+d['strategicRoads']['routes'][4:];d['strategicRoads']['version']=2
a['props']=[p for p in a['props'] if not p.get('laneDivider')];template=next(p for p in a['props'] if p['x']==928 and p['y']==672)
for x,y in [(928,792),(928,840),(928,1128),(904,1200),(904,1248)]:
 p=copy.deepcopy(template);dx=x-p['x'];dy=y-p['y'];p.update(x=x,y=y,laneDivider=True);p['blocks']=[[cx+dx//24,cy+dy//24]for cx,cy in p['blocks']];a['props'].append(p)
a['blocks']=sorted(set(tuple(b)for p in a['props']for b in p.get('blocks',[])))
write(r/'shared/level-data.js',d,'ZergLevel');write(r/'shared/art-data.js',a,'ZergArt')
