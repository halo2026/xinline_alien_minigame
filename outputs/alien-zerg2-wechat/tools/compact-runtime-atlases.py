"""Palette-pack runtime atlases at original dimensions, retaining source backups."""
from pathlib import Path
from PIL import Image
import shutil
R=Path(__file__).resolve().parents[1];backup=R.parents[1]/'work/campaign-import/atlas-original';backup.mkdir(parents=True,exist_ok=True)
saved=0
for p in sorted((R/'assets').glob('*atlas-*.png')):
 im=Image.open(p)
 if im.mode=='P':continue
 dst=backup/p.name
 if not dst.exists():shutil.copy2(p,dst)
 original=p.stat().st_size;im.convert('RGBA').quantize(colors=256,method=Image.Quantize.FASTOCTREE).save(p,optimize=True);saved+=original-p.stat().st_size
print('Saved',saved,'bytes; original dimensions retained')
