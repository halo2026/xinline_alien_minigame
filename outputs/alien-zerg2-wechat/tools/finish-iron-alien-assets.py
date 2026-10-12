from pathlib import Path
from PIL import Image
import json,re
R=Path(__file__).resolve().parents[1]
# Lossless 8-bit alpha encoded as palette indices, retaining all irregular edge coverage.
p=R/'assets/iron-alien-mask.png';a=Image.open(p).convert('RGBA').getchannel('A');mask=Image.frombytes('P',a.size,a.tobytes());mask.putpalette([255]*768);mask.info['transparency']=bytes(range(256));mask.save(p,optimize=True)
root=R.parents[1];scene=Image.open(root/'work/iron-alien/map.png').convert('RGBA');icon=Image.new('RGBA',(160,160));scene.thumbnail((154,120));icon.alpha_composite(scene,((160-scene.width)//2,40));data=json.loads((R/'shared/iron-alien-art.js').read_text().split('const a=',1)[1].split(';if',1)[0]);sheet=Image.open(R/'assets/iron-alien-duel.png').convert('RGBA')
for key,x,y,height in [('duel-predator/attack/0',32,21,110),('duel-queen/attack/0',79,26,110)]:
 f=data['frames'][key];im=sheet.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']));im=im.resize((round(im.width*height/im.height),height),Image.Resampling.LANCZOS);icon.alpha_composite(im,(x,y))
icon.save(R/'assets/iron-alien-icon.png',optimize=True)
print('assets',sum(p.stat().st_size for p in (R/'assets').glob('iron-alien*')))
