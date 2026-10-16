const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas'),fs=require('fs'),path=require('path'),R=path.resolve(__dirname,'..'),L=require('../shared/ringmine-layout');
(async()=>{GlobalFonts.registerFromPath('/System/Library/Fonts/STHeiti Medium.ttc','MineLabel');const c=createCanvas(...L.size),g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality="high";let seed=4;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const source=process.env.MINE_NATIVE_SOURCE||path.resolve(R,'../alien-ios/hero_alien.app/data');
// Blend original terrain samples over the entire map instead of repeating atlas tiles.
// The source atlas contains tile-edge lighting, so mirroring alone leaves square seams.
const terrain=await loadImage(path.join(source,'terrain/t_04.png')),ground=createCanvas(...L.size),gc=ground.getContext('2d');gc.fillStyle='#454746';gc.fillRect(0,0,...L.size);
const patch=createCanvas(192,192),pc=patch.getContext('2d'),mask=pc.createRadialGradient(96,96,32,96,96,96);mask.addColorStop(0,'#fff');mask.addColorStop(1,'#fff0');
for(let y=-96;y<L.size[1];y+=80)for(let x=-96;x<L.size[0];x+=80){pc.clearRect(0,0,192,192);pc.save();pc.translate(96,96);pc.rotate(rand()*Math.PI*2);pc.drawImage(terrain,256+rand()*96,rand()*96,128,128,-96,-96,192,192);pc.restore();pc.globalCompositeOperation='destination-in';pc.fillStyle=mask;pc.fillRect(0,0,192,192);pc.globalCompositeOperation='source-over';gc.drawImage(patch,x+rand()*20,y+rand()*20);}
const {execFileSync}=require('child_process'),meta=JSON.parse(execFileSync('python3',['-c','import plistlib,json,sys;print(json.dumps(plistlib.load(open(sys.argv[1],"rb"))))',path.join(source,'xlobj/xlobjs.plist')],{encoding:'utf8'})),sheet=await loadImage(path.join(source,'xlobj/xlobjs.png'));
const native=async(name)=>{const f=meta.frames['data/xlobj/'+name+'.png'],[x,y,w,h]=f.frame.match(/\d+/g).map(Number),c=createCanvas(w,h),q=c.getContext('2d');if(f.rotated){q.translate(0,h);q.rotate(-Math.PI/2);q.drawImage(sheet,x,y,h,w,0,0,h,w);}else q.drawImage(sheet,x,y,w,h,0,0,w,h);return c;};

const stroke=(ctx,points,width,style)=>{ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=width;ctx.strokeStyle=style;ctx.stroke();};
g.drawImage(ground,0,0);
// Same native four-corner terrain transitions as the Zerg campaign: rock, soil, sand.
const textures=await Promise.all([5,6].map(n=>loadImage(path.join(source,'terrain/t_0'+n+'.png')))),alphaAtlas=await loadImage(path.join(source,'terrain/alpha01.png'));
const tile=createCanvas(64,64),tc=tile.getContext('2d'),cornerDistance=new Map();
function roadDistance(x,y){const key=x+','+y;if(!cornerDistance.has(key))cornerDistance.set(key,Math.min(...L.roadShapes.map(r=>L.distance({x,y},r))));return cornerDistance.get(key);}
for(let y=0;y<L.size[1];y+=64)for(let x=0;x<L.size[0];x+=64){for(let layer=0;layer<2;layer++){let bits=0;for(const [dx,dy,bit]of [[0,0,8],[64,0,4],[0,64,2],[64,64,1]]){const noise=layer===0?10*Math.sin((x+dx)*.047)+7*Math.cos((y+dy)*.037):0;if(roadDistance(x+dx,y+dy)<L.roadWidth/2+(layer===0?43+noise:0))bits+=bit;}if(!bits)continue;tc.clearRect(0,0,64,64);tc.globalCompositeOperation='source-over';tc.drawImage(textures[layer],256+x%256,y%256,64,64,0,0,64,64);if(bits!==15){tc.globalCompositeOperation='destination-in';tc.drawImage(alphaAtlas,(bits-1)%4*64,Math.floor((bits-1)/4)*64,64,64,0,0,64,64);}g.drawImage(tile,x,y);}}
const gravelTile=createCanvas(256,256);gravelTile.getContext('2d').drawImage(textures[1],256,0,256,256,0,0,256,256);
// The ring embraces a shallow impact crater; its visible rim is excluded from construction.
const crater=await loadImage(path.resolve(R,'../../source-art/thunder-raid-asteroid/crater.png'));g.drawImage(crater,L.center.x-175,L.center.y-120,350,240);for(const h of L.craters)g.drawImage(crater,h.x-h.w/2,h.y-h.h/2,h.w,h.h);
const burrow=await loadImage(path.join(R,'assets/giant-brain-burrow.png'));
for(const route of L.routes.slice(0,2)){const p=route[0];g.fillStyle='#060a10aa';g.beginPath();g.ellipse(p.x,p.y+10,96,40,0,0,Math.PI*2);g.fill();g.drawImage(burrow,p.x-130,p.y-100,260,160);}
// Broken rock chips and shallow shadows settle into the native soil shoulder.
for(const route of L.roadShapes)for(let i=1;i<route.length;i++){const p=route[i],q=route[i-1],a=Math.atan2(p.y-q.y,p.x-q.x),length=Math.hypot(p.x-q.x,p.y-q.y);for(let d=0;d<length;d+=26+rand()*20)for(const sign of [-1,1]){const offset=83+rand()*24,x=q.x+Math.cos(a)*d-Math.sin(a)*sign*offset,y=q.y+Math.sin(a)*d+Math.cos(a)*sign*offset;if(Math.min(...L.roadShapes.map(r=>L.distance({x,y},r)))<78)continue;const w=3+rand()*7,h=2+rand()*4;g.fillStyle='#111a2166';g.beginPath();g.ellipse(x+2,y+3,w+2,h+1,a,0,Math.PI*2);g.fill();g.fillStyle=['#7a817b','#a6a591','#586765'][Math.floor(rand()*3)];g.beginPath();g.moveTo(x-w,y);g.lineTo(x-2,y-h);g.lineTo(x+w,y-1);g.lineTo(x+w*.5,y+h);g.closePath();g.fill();}}
// Worn service apron: irregular soil fringe, feathered concrete and open road entrance.
const floor=await loadImage(path.join(source,'terrain/t_13.png')),apron=createCanvas(...L.size),ac=apron.getContext('2d'),apronMask=createCanvas(...L.size),am=apronMask.getContext('2d');
const apronOutline=[{x:1690,y:430},{x:1810,y:420},{x:1840,y:490},{x:1990,y:510},{x:2020,y:740},{x:1980,y:855},{x:1800,y:875},{x:1700,y:825},{x:1680,y:630}];
function apronPath(ctx){ctx.beginPath();apronOutline.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();}
am.filter='blur(12px)';apronPath(am);am.fillStyle='#fff';am.fill();ac.fillStyle=ac.createPattern(floor,'repeat');ac.fillRect(0,0,...L.size);ac.globalCompositeOperation='destination-in';ac.drawImage(apronMask,0,0);
g.save();apronPath(g);g.lineJoin='round';g.lineWidth=38;g.strokeStyle='#837c5555';g.stroke();g.restore();g.drawImage(apron,0,0);
// Feather the approach road into concrete instead of stamping a round-ended strip over it.
const approach=createCanvas(...L.size),ap=approach.getContext('2d');stroke(ap,[{x:1620,y:990},{x:1740,y:730},{x:1900,y:730}],L.roadWidth,ap.createPattern(gravelTile,'repeat'));ap.globalCompositeOperation='destination-in';const fade=ap.createLinearGradient(1680,0,1900,0);fade.addColorStop(0,'#fff');fade.addColorStop(1,'#fff0');ap.fillStyle=fade;ap.fillRect(0,0,...L.size);g.drawImage(approach,0,0);
for(let i=0;i<apronOutline.length;i++){const p=apronOutline[i],q=apronOutline[(i+1)%apronOutline.length],d=Math.hypot(q.x-p.x,q.y-p.y);for(let t=0;t<d;t+=17+rand()*20){const x=p.x+(q.x-p.x)*t/d+(rand()-.5)*22,y=p.y+(q.y-p.y)*t/d+(rand()-.5)*22;if(Math.min(...L.roadShapes.map(r=>L.distance({x,y},r)))<L.roadWidth/2)continue;g.fillStyle=rand()<.5?'#38444088':'#b7ad8f88';g.beginPath();g.ellipse(x,y,2+rand()*5,1+rand()*3,rand()*3,0,Math.PI*2);g.fill();}}
const dock=await native('jidicheku2');g.drawImage(dock,L.playerStart.x-dock.width/2,L.playerStart.y-dock.height/2);g.strokeStyle='#ddc27e';g.lineWidth=3;g.setLineDash([12,9]);g.strokeRect(L.playerStart.x-65,L.playerStart.y-55,130,110);g.setLineDash([]);
// Composite the asteroid independently of its old rectangular terrain canvas.
const bounds=L.terrainBounds,renderScale=.5,out=createCanvas(Math.ceil(bounds.w*renderScale),Math.ceil(bounds.h*renderScale)),o=out.getContext('2d');
o.scale(renderScale,renderScale);o.translate(-bounds.x,-bounds.y);
const face=await loadImage(path.resolve(R,'../../source-art/thunder-raid-asteroid/cliff-face-v2.png'));
const edgeBottom=x=>{let y=-Infinity;for(let i=0;i<L.groundPerimeter.length;i++){const a=L.groundPerimeter[i],b=L.groundPerimeter[(i+1)%L.groundPerimeter.length];if((a.x<=x&&b.x>x)||(b.x<=x&&a.x>x))y=Math.max(y,a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x));}return y;};
for(let x=130;x<2180;x+=4){const bottom=edgeBottom(x+2);if(!Number.isFinite(bottom))continue;o.drawImage(face,(x-130)/2050*face.width,0,4/2050*face.width,face.height,x,bottom-95,4,310);}
// The surface blends into the exposed rock instead of ending at a straight polygon cut.
// Work in the same projected vertical depth as the cliff strips, so steep sides stay narrow.
const land=createCanvas(out.width,out.height),lc=land.getContext('2d');lc.scale(renderScale,renderScale);lc.translate(-bounds.x,-bounds.y);
lc.save();lc.beginPath();L.groundPerimeter.forEach((p,i)=>lc[i?'lineTo':'moveTo'](p.x,p.y));lc.closePath();lc.clip();
// Keep the north ground behind the upright ridge feet, not above its silhouette.
lc.beginPath();lc.rect(0,220,L.size[0],L.size[1]);lc.clip();
lc.fillStyle=lc.createPattern(ground,'repeat');lc.fillRect(0,0,L.size[0],L.size[1]+90);lc.drawImage(c,0,0);lc.drawImage(c,0,L.size[1]-30,L.size[0],30,0,L.size[1],L.size[0],90);lc.restore();
const surface=lc.getImageData(0,0,land.width,land.height),pixels=surface.data;
for(let px=0;px<land.width;px++){
 const x=(px+.5)/renderScale+bounds.x,bottom=edgeBottom(x);if(!Number.isFinite(bottom))continue;
 const variation=9*Math.sin(x*.079)+6*Math.sin(x*.193+1.8)+3*Math.sin(x*.47),fade=48+10*Math.sin(x*.027+1),from=Math.max(0,Math.floor((bottom-90-bounds.y)*renderScale)),to=Math.min(land.height-1,Math.ceil((bottom-bounds.y)*renderScale));
 for(let py=from;py<=to;py++){const y=(py+.5)/renderScale+bounds.y,i=(py*land.width+px)*4,grain=3*Math.sin(x*.67+y*.91)*Math.sin(y*.37-x*.43),t=Math.max(0,Math.min(1,(bottom-y-7-variation-grain)/fade));pixels[i+3]=Math.round(pixels[i+3]*t*t*(3-2*t));}
}
lc.putImageData(surface,0,0);o.drawImage(land,bounds.x,bounds.y,bounds.w,bounds.h);
const ridge=await loadImage(path.resolve(R,'../../source-art/thunder-raid-asteroid/ridge.png'));
// Each mountain keeps its real alpha silhouette. All lie outside the combat rings.
for(const side of [-1,1])for(let i=0;i<4;i++){
 const width=440+[15,65,-10,30,5][i],height=width*ridge.height/ridge.width,x=side<0?80+[20,-15,45,0,25][i]:L.size[0]-70-[5,40,-20,25,0][i],y=190+i*420+[0,35,-15,20,0][i];
 o.save();o.translate(x,y);o.scale(side<0?1:-1,1);o.drawImage(ridge,-width*.5,-height*.5,width,height);o.restore();
}
// Upright horizontal ridge, shared with Iron Hunter: no rotation or mirroring.
const northRidge=await loadImage(path.resolve(R,'../../source-art/iron-alien/north-ridge-upright.png'));
for(const [x,y,w,h]of [[65,-40,800,350],[710,-55,810,365],[1370,-30,850,350]])o.drawImage(northRidge,x,y,w,h);
// Flood only the native crater's enclosed transparent opening, preserving the jagged inner wall.
const hole=createCanvas(crater.width,crater.height),hc=hole.getContext('2d');hc.drawImage(crater,0,0);const src=hc.getImageData(0,0,hole.width,hole.height),cut=hc.createImageData(hole.width,hole.height),seen=new Uint8Array(hole.width*hole.height),queue=[Math.floor(hole.height/2)*hole.width+Math.floor(hole.width/2)];seen[queue[0]]=1;
for(let i=0;i<queue.length;i++){const n=queue[i];if(src.data[n*4+3]>=250)continue;cut.data[n*4+3]=255-src.data[n*4+3];const x=n%hole.width,y=Math.floor(n/hole.width);for(const v of [x>0?n-1:-1,x+1<hole.width?n+1:-1,y>0?n-hole.width:-1,y+1<hole.height?n+hole.width:-1])if(v>=0&&!seen[v]){seen[v]=1;queue.push(v);}}
hc.putImageData(cut,0,0);o.save();o.globalCompositeOperation='destination-out';for(const h of [{x:L.center.x,y:L.center.y,w:350,h:240},...L.craters])o.drawImage(hole,h.x-h.w/2,h.y-h.h/2,h.w,h.h);o.restore();
// Exact 8-bit alpha mask: narrow mountain tips and cliff notches remain transparent.
const rgba=o.getImageData(0,0,out.width,out.height).data,zlib=require('node:zlib'),scan=Buffer.alloc((out.width+1)*out.height);
for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++)scan[y*(out.width+1)+x+1]=rgba[(y*out.width+x)*4+3];
const chunk=(name,data)=>{const type=Buffer.from(name),b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length);type.copy(b,4);data.copy(b,8);b.writeUInt32BE(zlib.crc32(Buffer.concat([type,data])),data.length+8);return b;},header=Buffer.alloc(13);header.writeUInt32BE(out.width,0);header.writeUInt32BE(out.height,4);header[8]=8;header[9]=3;
fs.writeFileSync(path.join(R,'assets/ringmine-mask.png'),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('PLTE',Buffer.alloc(768,255)),chunk('tRNS',Buffer.from(Array.from({length:256},(_,i)=>i))),chunk('IDAT',zlib.deflateSync(scan,{level:9})),chunk('IEND',Buffer.alloc(0))]));
const encoded=out.toBuffer('image/jpeg',60);fs.writeFileSync(path.join(R,'assets/ringmine-terrain.jpg'),encoded);
// Review image shows the actual alpha before JPEG/mask separation.
fs.writeFileSync(path.resolve(R,'../../work/ringmine-asteroid-preview.png'),out.toBuffer('image/png'));
console.log('R outpost asteroid:',out.width,out.height,encoded.length,'bytes, JPEG60');
})();
