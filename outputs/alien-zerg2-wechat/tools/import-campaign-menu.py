from pathlib import Path
from PIL import Image
import wave,struct,shutil
R=Path(__file__).resolve().parents[1];S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data/image'
names=['zerg','snake','fish','airship','machanics','scorpion']
im=Image.new('RGBA',(160*8,160))
for i,name in enumerate(names):
 pic=Image.open(S/f'icon/chapter/img_chapter_{name}.png').convert('RGBA');pic.thumbnail((160,160),Image.Resampling.LANCZOS);im.alpha_composite(pic,(i*160+(160-pic.width)//2,(160-pic.height)//2))
pic=Image.open(R/'artwork/greenstar/kryptonite-mine-icon.png').convert('RGBA');pic.thumbnail((160,160),Image.Resampling.LANCZOS);im.alpha_composite(pic,(960+(160-pic.width)//2,(160-pic.height)//2))
pic=Image.open(R/'artwork/zerg1/escort-icon.png').convert('RGBA');pic.thumbnail((152,152),Image.Resampling.LANCZOS);im.alpha_composite(pic,(1120+(160-pic.width)//2,(160-pic.height)//2))
im.quantize(colors=192,method=Image.Quantize.FASTOCTREE).save(R/'assets/campaign-nodes.png',optimize=True)
bg=Image.open(S/'misc/controlcenter/BG.png').convert('RGB');bg.thumbnail((768,768),Image.Resampling.LANCZOS);bg.save(R/'assets/campaign-space.jpg',quality=72,optimize=True)
# Preserve sound timing and PCM depth; the UI sound does not need stereo positioning.
p=R/'assets/magic14.wav';backup=R.parents[1]/'work/campaign-import/magic14-stereo.wav';backup.parent.mkdir(parents=True,exist_ok=True)
if not backup.exists():shutil.copy2(p,backup)
with wave.open(str(backup)) as src:
 params=src.getparams();data=src.readframes(params.nframes)
if params.nchannels==2 and params.sampwidth==2:
 samples=struct.unpack('<'+'h'*(len(data)//2),data);mono=[round((samples[i]+samples[i+1])/2) for i in range(0,len(samples),2)]
 with wave.open(str(p),'wb') as dst:dst.setparams((1,2,params.framerate,params.nframes,'NONE','not compressed'));dst.writeframes(struct.pack('<'+'h'*len(mono),*mono))
print('Imported original campaign illustrations and starfield')
