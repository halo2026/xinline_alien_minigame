from pathlib import Path
import plistlib,zlib,struct,re,json
from PIL import Image,ImageChops
R=Path(__file__).resolve().parents[1];S=R.parent/'cema-reference'
nums=lambda s:list(map(int,re.findall(r'-?\d+',s)))
def sprite(sheet,f):
 x,y,w,h=nums(f['frame']);im=sheet.crop((x,y,x+(h if f['rotated'] else w),y+(w if f['rotated'] else h)))
 if f['rotated']:im=im.transpose(Image.Transpose.ROTATE_90)
 out=Image.new('RGBA',tuple(nums(f['sourceSize'])));ox,oy=nums(f['sourceColorRect'])[:2];out.paste(im,(ox,oy));return out
frames=plistlib.load((S/'xlobj/xlobjs_water.plist').open('rb'))['frames'];sheet=Image.open(S/'xlobj/xlobjs_water.png').convert('RGBA')
bottom=sprite(sheet,frames['data/xlobj/lake02.png']);shore=sprite(sheet,frames['data/xlobj/lake02_mask.png'])
raw=zlib.decompress((S/'terrain/water_ani.pvr.ccz').read_bytes()[16:]);head=struct.unpack('<13I',raw[:52]);assert head[6]==16 and head[7:11]==(61440,3840,240,15)
pix=struct.unpack('<'+'H'*(head[1]*head[2]),raw[52:52+head[1]*head[2]*2]);rgba=bytes(v for p in pix for v in (((p>>12)&15)*17,((p>>8)&15)*17,((p>>4)&15)*17,(p&15)*17));tex=Image.frombytes('RGBA',(head[2],head[1]),rgba)
wf=plistlib.load((S/'terrain/water_ani.plist').open('rb'))['frames']
# Preserve native 20 frames / .06s and 150/255 water opacity inside lake alpha.
atlas=Image.new('RGBA',(128*5,128*4))
for i in range(20):
 water=sprite(tex,wf[f'water_{i+1:02}.png']);water.putalpha(ImageChops.multiply(water.getchannel('A').point(lambda a:round(a*150/255)),bottom.getchannel('A')))
 im=Image.alpha_composite(bottom,water);im=Image.alpha_composite(im,shore);atlas.paste(im.resize((128,128),Image.Resampling.LANCZOS),(i%5*128,i//5*128))
atlas.quantize(colors=96,method=Image.Quantize.FASTOCTREE).save(R/'assets/wolf-water.png',optimize=True)
p=R/'shared/art-data.js';s=p.read_text();a=json.loads(s[s.index('const d=')+8:s.index(';if(typeof module')]);page=a['pages'].index('wolf-water.png') if 'wolf-water.png' in a['pages'] else len(a['pages'])
if page==len(a['pages']):a['pages'].append('wolf-water.png')
for i in range(20):a['frames'][f'wolf-water/{i}']={'x':i%5*128,'y':i//5*128,'w':128,'h':128,'ox':-64,'oy':-64,'page':page}
p.write_text('(function(){const d='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();')
print('water bytes',(R/'assets/wolf-water.png').stat().st_size)
