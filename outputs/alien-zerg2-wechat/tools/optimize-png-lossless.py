from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
import zopfli.png,io
R=Path('outputs/alien-zerg2-wechat');B=Path('work/lossless-png-backup');B.mkdir(exist_ok=True)
def go(p):
 raw=p.read_bytes();out=zopfli.png.optimize(raw,use_zopfli=False)
 if len(out)>=len(raw):return 0
 assert Image.open(io.BytesIO(raw)).convert('RGBA').tobytes()==Image.open(io.BytesIO(out)).convert('RGBA').tobytes()
 backup=B/p.name
 if not backup.exists():backup.write_bytes(raw)
 p.write_bytes(out)
 if p.name.startswith('wolf-'):
  q=Path('outputs/alien-wolf-wechat/assets')/('terrain.png' if p.name=='wolf-terrain.png' else p.name)
  if q.exists() and q.read_bytes()==raw:q.write_bytes(out)
 print(p.name,len(raw)-len(out),flush=True);return len(raw)-len(out)
with ThreadPoolExecutor(3) as ex: print('TOTAL',sum(ex.map(go,[p for p in (R/'assets').glob('*.png') if p.name!='on-foot.png'])),flush=True)
