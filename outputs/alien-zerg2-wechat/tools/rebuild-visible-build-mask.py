from pathlib import Path
import json
from PIL import Image,ImageStat
R=Path(__file__).resolve().parents[1]
source=(R/'tools/compose-strategic-terrain.py').read_text()
exec(source[:source.index("ground=Image.new")])
d=read(R/'shared/level-data.js')
roadmask=Image.new('L',tuple(d['size']));landmask=Image.new('L',tuple(d['size']))
for i,layers in enumerate(d['terrainTiles']):
 x=i%d['terrainGrid']['cols'];y=i//d['terrainGrid']['cols']
 for tid,bits in layers:
  if tid and bits:
   im=tile(tid,bits,x,y)
   if tid==4:landmask.paste(im.getchannel('A'),(x*64,y*64))
   if tid==6:roadmask.paste(im.getchannel('A'),(x*64,y*64))
m=d['buildTerrain'];old=m['cells'];cells=[]
for y in range(m['rows']):
 for x in range(m['cols']):
  box=(x*16,y*16,x*16+16,y*16+16)
  land=ImageStat.Stat(landmask.crop(box)).mean[0];road=ImageStat.Stat(roadmask.crop(box)).mean[0]
  cells.append(0 if land<160 else 2 if road>=128 else 1)
m.update(cells=cells,classification='visible land alpha >=160; road majority coverage >=128; blended non-road edges buildable, full footprint and rocks still checked')
write(R/'shared/level-data.js',d,'ZergLevel')
print('Reclassified road-edge cells:',sum(a==2 and b==1 for a,b in zip(old,cells)))
