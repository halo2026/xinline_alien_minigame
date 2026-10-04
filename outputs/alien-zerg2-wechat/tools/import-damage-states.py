"""Pack imagegen damage variants at native sprite anchors; no runtime image processing."""
from pathlib import Path
import json,subprocess,shutil
from PIL import Image
R=Path(__file__).resolve().parents[1];NODE=R.parents[1]/'work/gear-render/node-v22.14.0-darwin-arm64/bin/node'
def data(path):return json.loads(subprocess.check_output([str(NODE),'-e','process.stdout.write(JSON.stringify(require(process.argv[1])))',str(path)]))
A=data(R/'shared/art-data.js');Z=data(R/'shared/zerg1-data.js')['art'];items=[];groups={}
for tier,label in enumerate(['light','medium','heavy'],1):
 sheet=Image.open(R/'artwork/convoy-damage'/f'{label}.png').convert('RGBA');cw,ch=sheet.width//3,sheet.height//2
 role=f'convoy-damage-{tier}';rows={}
 for row in range(1,6):
  col,rr=(row-1)%3,(row-1)//3;im=sheet.crop((col*cw,rr*ch,(col+1)*cw,(rr+1)*ch));bbox=im.getchannel('A').point(lambda alpha:255 if alpha>8 else 0).getbbox();assert bbox
  f=Z['frames'][Z['groups']['convoy']['anim']['walk'][str(row)][0]]
  # Each generated direction is registered to the original frame's trim rectangle.
  im=im.crop(bbox).resize((f['w']*2,f['h']*2),Image.Resampling.LANCZOS);key=f'{role}/{row}'
  items.append((key,im,{'ox':f['ox'],'oy':f['oy'],'ow':f['w'],'oh':f['h']}));rows[str(row)]=[key]
 groups[role]={'dirs':8,'anim':{'stand':rows,'walk':rows},'intervals':{'stand':.12,'walk':.12}}
 role=f'refinery-damage-{tier}';im=Image.open(R/'artwork/refinery-damage'/f'{label}.png').convert('RGBA');bbox=im.getchannel('A').point(lambda alpha:255 if alpha>8 else 0).getbbox();assert bbox
 f=A['frames'][A['groups']['refinery']['anim']['stand']['1'][0]]
 im=im.crop(bbox).resize((f['w'],f['h']),Image.Resampling.LANCZOS);items.append((role,im,{'ox':f['ox'],'oy':f['oy'],'ow':f.get('ow',f['w']),'oh':f.get('oh',f['h'])}));groups[role]={'dirs':2,'anim':{'stand':{'1':[role]}},'intervals':{'stand':.12}}
page='damage-states.png';atlas=Image.new('RGBA',(2048,2048));x=y=rh=0;frames={}
for key,im,meta in sorted(items,key=lambda a:-a[1].height):
 if x+im.width+2>2048:x=0;y+=rh+2;rh=0
 assert y+im.height<=2048
 atlas.paste(im,(x,y));frames[key]={**meta,'x':x,'y':y,'w':im.width,'h':im.height};x+=im.width+2;rh=max(rh,im.height)
atlas=atlas.crop((0,0,2048,y+rh)).quantize(colors=256,method=Image.Quantize.FASTOCTREE)
for root in [R,R.parent/'alien-wolf-wechat']:
 a=data(root/'shared/art-data.js')
 if page not in a['pages']:a['pages'].append(page)
 a['groups'].update(groups);a['frames'].update({k:{**v,'page':a['pages'].index(page)} for k,v in frames.items()})
 (root/'shared/art-data.js').write_text('(function(){const d='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergArt=d;})();')
 atlas.save(root/'assets'/page,optimize=True)
print('Packed 3 convoy direction sets and 3 refinery stages:',(R/'assets'/page).stat().st_size,'bytes')
