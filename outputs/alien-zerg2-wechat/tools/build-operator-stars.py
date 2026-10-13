"""Pack approved generated portraits without changing their composition."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import json,io
root=Path(__file__).resolve().parents[1]
sources=root/'source-art/operator-stars/original-aligned-v3'
manifest_path=sources/'manifest.json'
jobs=json.loads(manifest_path.read_text());assert len(jobs)==22
atlas=Image.new('RGB',(3300,970),'#081119')
contact=Image.new('RGB',(6*300,4*515),'#081119');draw=ImageDraw.Draw(contact)
for n,job in enumerate(sorted(jobs,key=lambda j:(j['index'],j['stars']))):
 im=Image.open(sources/job['file']).convert('RGB');tile=ImageOps.fit(im,(300,485),Image.Resampling.LANCZOS)
 atlas.paste(tile,(job['index']*300,(job['stars']-2)*485))
 x=n%6*300;y=n//6*515;contact.paste(tile,(x,y));draw.text((x+8,y+488),f"{job['role']} / {job['stars']} STAR",fill='#ffe0a0')
# Keep the original portrait pixel dimensions within the shared package budget.
for quality in range(82,39,-1):
 buffer=io.BytesIO()
 atlas.save(buffer,format='JPEG',quality=quality,optimize=True,progressive=True,subsampling=2)
 if buffer.tell()<=540000:break
else:raise RuntimeError('Portrait atlas cannot fit its package budget')
(root/'assets/operator-stars.jpg').write_bytes(buffer.getvalue())
print('JPEG quality',quality)
contact.save(root.parents[1]/'work/0052-all-operator-stars.jpg',quality=90)
print('Atlas bytes', (root/'assets/operator-stars.jpg').stat().st_size)

