"""Rebuild fortress walking footprint from authored deck/glass tiles, not opacity."""
from pathlib import Path
import json,re,struct
R=Path(__file__).resolve().parents[1];S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data'
b=(S/'map/world/yxys_mechanics_002.ter').read_bytes();_,_,w,h,_,default,_,_=struct.unpack_from('<4h4i',b);tiles=[[(default,15)] for _ in range(w*h)];off=24
while off<len(b):
 x,y,count=struct.unpack_from('<hhB',b,off);off+=5;ls=[]
 for _ in range(count):ls.append(struct.unpack_from('BB',b,off));off+=2
 tiles[y*w+x]=ls
p=R/'shared/fortress2-data.js';s=p.read_text();start=re.search(r'const data=',s).end();d,n=json.JSONDecoder().raw_decode(s[start:]);d['navigationTerrain']={'cellSize':64,'cols':w,'rows':h,'cells':''.join('1' if any(t in [11,12] and a for t,a in ls) else '0' for ls in tiles)};p.write_text(s[:start]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[start+n:])
