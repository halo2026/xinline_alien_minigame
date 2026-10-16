"""Pack generated tower foundations with mounting-centre pivots and logical world sizes."""
from pathlib import Path
import json, hashlib, math
from PIL import Image, ImageDraw
R=Path(__file__).resolve().parents[1]; S=R/'source-art/tower-bases-v2'
p=R/'shared/art-data.js';s=p.read_text();a=json.JSONDecoder().raw_decode(s[s.index('const data=')+11:])[0]
page='tower-bases-v1.png'
if page not in a['pages']:a['pages'].append(page)
atlas=Image.new('RGBA',(1280,256));manifest=[]
# Lower the attachment pivot by 4 world pixels for the oblique camera.
MOUNT_DROP=4
RAY_EXTRA_DROP=2
# Source mounting-disc centres; feet and perspective thickness must not recenter the gun.
for i,(id,pivot,width) in enumerate([(12200,(687,495),78),(12202,(724,385),83),(12205,(687,474),94),(12204,(687,554),78)]):
 source=(R/'source-art/cannon-siege-base-v3/12205.png') if id==12205 else S/f'{id}.png';im=Image.open(source).convert('RGBA');b=im.getchannel('A').point(lambda v:255 if v>8 else 0).getbbox()
 b=(max(0,b[0]-4),max(0,b[1]-4),min(im.width,b[2]+4),min(im.height,b[3]+4));crop=im.crop(b)
 scale=width/crop.width;tile=crop.resize((188,round(crop.height*188/crop.width)),Image.Resampling.LANCZOS);x=i*192+2;y=2
 frame=f'tower-base/{id}'
 mount_drop=MOUNT_DROP+(RAY_EXTRA_DROP if id==12204 else 0)
 a['frames'][frame]={'x':x,'y':y,'w':tile.width,'h':tile.height,'ow':width,'oh':crop.height*scale,'ox':(b[0]-pivot[0])*scale,'oy':(b[1]-pivot[1])*scale-mount_drop,'page':a['pages'].index(page)}
 # Bake the former Canvas ground decoration behind the base. Padding changes
 # only frame bounds: original base pixels and the mounting pivot stay aligned.
 f=a['frames'][frame];ppu=188/width;rx=f['ow']*.53;ry=f['oh']*.34;cy=f['oy']+f['oh']*.64
 left=min(f['ox'],-rx*1.09-12);top=min(f['oy'],cy-ry*1.09-10)
 right=max(f['ox']+f['ow'],rx*1.09+12);bottom=max(f['oy']+f['oh'],cy+ry*1.09+12)
 pad_x=math.ceil((f['ox']-left)*ppu);pad_y=math.ceil((f['oy']-top)*ppu)
 ox=f['ox']-pad_x/ppu;oy=f['oy']-pad_y/ppu
 tw=math.ceil((right-ox)*ppu);th=math.ceil((bottom-oy)*ppu)
 ground=Image.new('RGBA',(tw*2,th*2));unit=ppu*2
 def polygon(points,color):
  layer=Image.new('RGBA',ground.size);d=ImageDraw.Draw(layer)
  d.polygon([((px-ox)*unit,(py-oy)*unit) for px,py in points],fill=color);ground.alpha_composite(layer)
 def ellipse(cx,cy,rx,ry,angle,color):
  ca=math.cos(angle);sa=math.sin(angle)
  polygon([(cx+math.cos(j*math.tau/64)*rx*ca-math.sin(j*math.tau/64)*ry*sa,cy+math.cos(j*math.tau/64)*rx*sa+math.sin(j*math.tau/64)*ry*ca) for j in range(64)],color)
 for k in range(3,-1,-1):ellipse(0,cy+3,rx+k*2,ry+k*1.5,0,(22,20,17,41 if k==0 else 11))
 seed=id*.37
 for j in range(13):
  angle=j*2.399+seed;r=1+(math.sin(seed+j*7.1)+1)*.045
  px=math.cos(angle)*rx*r;py=cy+math.sin(angle)*ry*r;size=1.1+(math.sin(j*9.7+seed)+1)*.75
  ellipse(px,py+1,size*3,size*1.5,angle*.2,(125,112,88,31))
  ellipse(px+.6,py+1.3,size*1.2,size*.65,0,(24,23,20,61))
  polygon([(px-size,py),(px-size*.3,py-size*.7),(px+size,py-size*.25),(px+size*.6,py+size*.5)],(132,126,110,122) if j%3 else (173,159,129,107))
 ground=ground.resize((tw,th),Image.Resampling.LANCZOS);ground.alpha_composite(tile,(pad_x,pad_y))
 x=i*320+2;y=2
 assert tw<=316 and th<=252,(id,tw,th)
 atlas.paste(ground,(x,y));f.update(x=x,y=y,w=tw,h=th,ow=tw/ppu,oh=th/ppu,ox=ox,oy=oy)
 manifest.append({'frame':frame,'source':str(source.relative_to(R)),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'crop':b,'mountPivot':pivot,'mountDropWorld':mount_drop,'worldWidth':width,'contactBaked':True,'basePixelOffset':[pad_x,pad_y],'atlasWorldBounds':[ox,oy,tw/ppu,th/ppu]})
atlas.save(R/'assets'/page,optimize=True)
p.write_text('(function(){const data='+json.dumps(a,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=data;else globalThis.ZergArt=data;})();')
(S/'manifest.json').write_text(json.dumps({'generator':'built-in image_gen','frames':manifest},ensure_ascii=False,indent=2))
p=R/'art-provenance.json';records=[r for r in json.loads(p.read_text()) if not r.get('frame','').startswith('tower-base/')]
records += [{'frame':r['frame'],'source':r['source'],'generator':'built-in image_gen'} for r in manifest];p.write_text(json.dumps(records,ensure_ascii=False,indent=2))
print('Packed foundations:',(R/'assets'/page).stat().st_size,'bytes')
