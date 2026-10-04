"""Restore native building facing and matching BIF occupancy in existing campaign exports.
XLCharacter::_UpdateFaceAngle flips buildings whenever the authored facing is nonzero.
This also preserves the expanded Zerg II map's translated perimeter objects.
"""
from pathlib import Path
import json,re,plistlib
R=Path(__file__).resolve().parents[1];S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data'
source=(S/'tabs/tab_unit.lua').read_text();packed=plistlib.load((S/'xlobj/xlobjs.plist').open('rb'))['frames']
def read(p):
 s=p.read_text();m=re.search(r'const (?:data|d)=',s);d,n=json.JSONDecoder().raw_decode(s[m.end():]);return s,m.end(),m.end()+n,d
def save(p,t):
 s,start,end,d=t;p.write_text(s[:start]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[end:])
for cid in ['zerg','zerg1','snake3','fish3','airship3','fortress2','scorpion2']:
 if cid=='zerg':
  units=read(R/'shared/level-data.js')[3]['units'];p=R/'shared/art-data.js';t=read(p);art=t[3]
 else:
  p=R/'shared'/f'{cid}-data.js';t=read(p);units=t[3]['units'];art=t[3]['art']
 seen={};blocks=set()
 for prop in art['props']:
  uid=int(prop['frame'].split('/')[-1]);seq=[u for u in units if u[0]==4 and u[1]==uid];index=seen.get(uid,0);seen[uid]=index+1
  if index>=len(seq):raise ValueError((cid,uid,index))
  u=seq[index];prop['flip']=bool(u[5]);m=re.search(r'_tab_unit\['+str(uid)+r'\]\s*=\s*\{(.*?)\n\}',source,re.S);raw=m[1];model=re.search(r'xlobj\s*=\s*"([^"]+)"',raw)[1];z=re.search(r'zOrder\s*=\s*(-?\d+)',raw);prop['zOrder']=int(z[1]) if z else 0
  frame=packed.get(f'data/xlobj/{model}.png');
  if frame:prop['w'],prop['h']=map(int,re.findall(r'\d+',frame.get('sourceSize',frame.get('spriteSourceSize'))))
  file=S/'xlobj'/f'{model}.bif';b=file.read_bytes() if file.exists() else b'';prop['blocks']=[]
  if len(b)>=1228:
   for x in range(20):
    for y in range(20):
     if b[28+x*20+y]:
      xx=int(prop['w']/16)-1-x if prop['flip'] else x
      cell=(int((int((prop['x']-prop['w']/2)/16)+xx)*16+8)//24,int((int((prop['y']-prop['h']/2)/16)+y)*16+8)//24)
      prop['blocks'].append(cell);blocks.add(cell)
 art['blocks']=sorted(blocks);save(p,t)
 print(cid,':',len(art['props']),'native scenery objects corrected')
