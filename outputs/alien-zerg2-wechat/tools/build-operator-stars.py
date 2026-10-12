"""Pack approved generated portraits without changing their composition."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import json
root=Path(__file__).resolve().parents[1]
sources=root/'source-art/operator-stars/clean-v2'
manifest_path=sources/'manifest.json'
jobs=json.loads(manifest_path.read_text());assert len(jobs)==22
atlas=Image.new('RGB',(2640,720),'#081119')
contact=Image.new('RGB',(6*240,4*390),'#081119');draw=ImageDraw.Draw(contact)
for n,job in enumerate(sorted(jobs,key=lambda j:(j['index'],j['stars']))):
 im=Image.open(sources/job['file']).convert('RGB');tile=ImageOps.fit(im,(240,360),Image.Resampling.LANCZOS)
 atlas.paste(tile,(job['index']*240,(job['stars']-2)*360))
 x=n%6*240;y=n//6*390;contact.paste(tile,(x,y));draw.text((x+8,y+363),f"{job['role']} / {job['stars']} STAR",fill='#ffe0a0')
atlas.resize((2112,576),Image.Resampling.LANCZOS).save(root/'assets/operator-stars.jpg',quality=72,optimize=True,subsampling=2)
contact.save(root.parents[1]/'work/0050-all-operator-stars.jpg',quality=90)
print('Atlas bytes', (root/'assets/operator-stars.jpg').stat().st_size)

