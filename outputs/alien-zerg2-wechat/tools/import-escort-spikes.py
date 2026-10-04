"""Restore unit 12517 skill 14036 native effects 3009/3139 and ImpaleHit."""
from pathlib import Path
from PIL import Image
import plistlib,re,json,shutil
r=Path(__file__).resolve().parents[1];source=r.parent/'alien-mac/source/XLFramework/Projects/alien_source/data'
frames=[]
for row,(y,h) in enumerate([(0,60),(60,70)]):
 for col in range(6):frames.append([col*70,y,70,h,-35,-h/2])
dust=[]
nums=lambda s:list(map(int,re.findall(r'-?\d+',s)))
pf=plistlib.load((source/'image/effect/dust2.plist').open('rb'))['frames'];atlas=Image.open(source/'image/effect/dust2.png').convert('RGBA');tiles=[]
for key,f in sorted(pf.items()):
 x,y,w,h=nums(f['frame']);rot=f.get('rotated',False);im=atlas.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:im=im.transpose(Image.Transpose.ROTATE_90)
 sw,sh=nums(f['sourceSize']);cx,cy=nums(f['sourceColorRect'])[:2];tiles.append(im);dust.append([0,0,w,h,cx-sw/2,cy-sh/2])
# Repack only native cells; retain original anchor offsets and scale.
w=512;x=y=rowh=0
for f,im in zip(dust,tiles):
 if x+im.width>w:x=0;y+=rowh+2;rowh=0
 f[0:2]=[x,y];x+=im.width+2;rowh=max(rowh,im.height)
out=Image.new('RGBA',(w,y+rowh))
for f,im in zip(dust,tiles):out.alpha_composite(im,(f[0],f[1]))
out.quantize(colors=192,method=Image.Quantize.FASTOCTREE).save(r/'assets/escort-spike-dust.png',optimize=True)
shutil.copy2(source/'image/effect/mini_dici.png',r/'assets/escort-spikes.png');shutil.copy2(source/'sound/ImpaleHit.wav',r/'assets/impale-native.wav')
p=r/'shared/zerg1-runtime.js';s=p.read_text();line='const spikeArt='+json.dumps({'spikes':frames,'dust':dust},separators=(',',':'))+'; // native-spike-art'
if '// native-spike-art' in s:s=re.sub(r'const spikeArt=.*?; // native-spike-art',lambda m:line,s)
else:s=s.replace('(function(){','(function(){\n'+line,1)
p.write_text(s);print('Native spikes',len(frames),'dust',len(dust))
