from pathlib import Path
import json,copy
r=Path(__file__).resolve().parents[1]
def read(p):
 s=p.read_text();return json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')])
def write(p,d,name):p.write_text('(function(){const d='+json.dumps(d,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.'+name+'=d;})();')
d=read(r/'shared/level-data.js');a=read(r/'shared/art-data.js')
d['units']=[u for u in d['units'] if not(u[0]==11 and u[6]==31)];d['units'].append([11,69998,0,252,1308,180,31])
d['ambush']={'spawn':31,'waves':[5,7,9],'counts':[6,8,10],'sideCave':True}
d['strategicRoads']['entries']['31']=[{'x':300,'y':1308}]
route=[(276,1236),(276,1080),(276,936),(276,828),(444,828),(540,924),(516,1104),(540,1260),(612,1404),(744,1500)]
d['strategicRoads']['routes']=d['strategicRoads']['routes'][:4]+[[dict(x=x,y=y)for x,y in route]]
a['props']=[p for p in a['props'] if not p.get('ambushSeal') and not(p['frame']=='prop/5140' and p['x'] in [400,432] and p['y']>=1300)];t=next(p for p in a['props'] if p['x']==928 and p['y']==672)
for x,y in [(232,1440),(304,1440),(400,1320),(400,1392),(280,1416),(352,1440)]:
 p=copy.deepcopy(t);dx=x-p['x'];dy=y-p['y'];p.update(x=x,y=y,ambushSeal=True);p['blocks']=[[cx+dx//24,cy+dy//24]for cx,cy in p['blocks']];a['props'].append(p)
for p in a['props']:
 if not p.get('ambushSeal') and not p.get('ambushShift') and p['x']<280 and 750<=p['y']<=1350:
  p['x']-=72;p['blocks']=[[x-3,y]for x,y in p.get('blocks',[])];p['ambushShift']=True
a['blocks']=sorted(set(tuple(b)for p in a['props']for b in p.get('blocks',[])))
write(r/'shared/level-data.js',d,'ZergLevel');write(r/'shared/art-data.js',a,'ZergArt')
