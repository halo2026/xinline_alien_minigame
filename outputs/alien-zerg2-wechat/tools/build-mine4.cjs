const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas'),fs=require('fs'),path=require('path'),R=path.resolve(__dirname,'..'),L=require('../shared/mine4-layout');
(async()=>{GlobalFonts.registerFromPath('/System/Library/Fonts/STHeiti Medium.ttc','MineLabel');const c=createCanvas(...L.size),g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality="high";let seed=4;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const source=process.env.MINE_NATIVE_SOURCE||path.resolve(R,'../../..','source/data');
// Blend original terrain samples over the entire map instead of repeating atlas tiles.
// The source atlas contains tile-edge lighting, so mirroring alone leaves square seams.
const terrain=await loadImage(path.join(source,'terrain/t_05.png')),ground=createCanvas(...L.size),gc=ground.getContext('2d');gc.fillStyle='#454746';gc.fillRect(0,0,...L.size);
const patch=createCanvas(192,192),pc=patch.getContext('2d'),mask=pc.createRadialGradient(96,96,32,96,96,96);mask.addColorStop(0,'#fff');mask.addColorStop(1,'#fff0');
for(let y=-96;y<L.size[1];y+=80)for(let x=-96;x<L.size[0];x+=80){pc.clearRect(0,0,192,192);pc.save();pc.translate(96,96);pc.rotate(rand()*Math.PI*2);pc.drawImage(terrain,128+rand()*48,128+rand()*48,128,128,-96,-96,192,192);pc.restore();pc.globalCompositeOperation='destination-in';pc.fillStyle=mask;pc.fillRect(0,0,192,192);pc.globalCompositeOperation='source-over';gc.drawImage(patch,x+rand()*20,y+rand()*20);}
const earth=g.createPattern(ground,'no-repeat');g.fillStyle=earth;g.fillRect(0,0,...L.size);g.fillStyle='#131b2080';g.fillRect(0,0,...L.size);
const stroke=(points,width,color,dy=0)=>{g.beginPath();g.moveTo(points[0].x,points[0].y+dy);for(let i=1;i<points.length-1;i++){const p=points[i],q=points[i+1];g.quadraticCurveTo(p.x,p.y+dy,(p.x+q.x)/2,(p.y+q.y)/2+dy);}const end=points.at(-1);g.lineTo(end.x,end.y+dy);g.lineWidth=width;g.strokeStyle=color;g.lineJoin='round';g.lineCap='round';g.stroke();};
// Tiered cut-rock walls cast shadows underneath the raised tower terrace.
stroke(L.route,208,'#050a0ee0',22);stroke(L.route,188,'#626763');stroke(L.route,171,'#303a3d');stroke(L.route,144,'#85887d');stroke(L.route,127,'#62655c');
stroke(L.platform,210,'#060b0fcc',27);stroke(L.platform,200,'#8d9183');stroke(L.platform,184,'#4d534d');stroke(L.platform,166,'#59645b');
g.save();g.globalAlpha=.85;stroke(L.route,137,earth);g.globalAlpha=.45;stroke(L.platform,170,earth);g.restore();
// Exposed inward-facing cliff bands: the next outer turn sits above the inner turn.
const inward=(p,n)=>{const a=Math.atan2(p.y-L.center.y,p.x-L.center.x);return {x:p.x-Math.cos(a)*n,y:p.y-Math.sin(a)*n};};
for(const [points,width]of [[L.route.slice(0,L.approachStart+1),L.roadWidth],[L.platform,L.platformWidth]]){
 for(let layer=30;layer>=0;layer-=3){const edge=points.map(p=>inward(p,width/2+layer));stroke(edge,4,layer>23?'#101416':layer>13?'#35302b':layer>4?'#5a4f40':'#b09a70');}
 for(let i=1;i<points.length;i+=2){const a=inward(points[i],width/2+2),b=inward(points[i],width/2+27);stroke([a,b],.7,i%3?'#171b1b30':'#bb9d6920');}
}
for(const ramp of L.ramps){stroke(ramp,66,'#39352d');stroke(ramp,58,earth);}
// Original rock outcrops from the shipped native object atlas.
const {execFileSync}=require('child_process'),meta=JSON.parse(execFileSync('python3',['-c','import plistlib,json,sys;print(json.dumps(plistlib.load(open(sys.argv[1],"rb"))))',path.join(source,'xlobj/xlobjs.plist')],{encoding:'utf8'})),sheet=await loadImage(path.join(source,'xlobj/xlobjs.png'));
const native=async(name)=>{const f=meta.frames['data/xlobj/'+name+'.png'],[x,y,w,h]=f.frame.match(/\d+/g).map(Number),c=createCanvas(w,h),q=c.getContext('2d');if(f.rotated){q.translate(0,h);q.rotate(-Math.PI/2);q.drawImage(sheet,x,y,h,w,0,0,h,w);}else q.drawImage(sheet,x,y,w,h,0,0,w,h);return c;};
// The same native mineral mountains used by the kryptonite-vein campaign.
const stones=await Promise.all(['cartoon_stone05','cartoon_stone06'].map(native));
const mineralStones=await Promise.all(['mine_stone01','mine_stone02','mine_stone03','mine_stone04'].map(async name=>{const im=await loadImage(path.join(source,'xlobj',name+'.png')),scale=Math.min(1,185/im.height),out=createCanvas(Math.round(im.width*scale),Math.round(im.height*scale));out.getContext('2d').drawImage(im,0,0,out.width,out.height);return out;}));
const clear=(x,y,r)=>L.distance({x,y},L.route)>L.roadWidth/2+r&&L.distance({x,y},L.platform)>L.platformWidth/2+r&&!(x>760-r&&x<1560+r&&y>2150-r)&&Math.hypot(x-1152,y-1120)>130+r;
// Sparse outcrops leave the canyon floor visible; no rock overlaps a buildable terrace.
// Match view.js prop rendering at scale 1: preserve each native frame's width/height.
for(let y=410;y<2200;y+=270)for(let x=440;x<1880;x+=260){const px=x+rand()*70,py=y+rand()*65,index=Math.floor(rand()*2),im=Math.hypot(px-L.center.x,py-L.center.y)<760?mineralStones[(Math.floor(x/145)+Math.floor(y/150))%4]:stones[index];if(!clear(px,py,Math.max(im.width,im.height)*.55))continue;g.drawImage(im,px-im.width/2,py-im.height/2,im.width,im.height);}
for(let i=9;i<240;i+=18){const p=L.route[i],q=L.route[i+1],a=Math.atan2(q.y-p.y,q.x-p.x);g.save();g.translate(p.x,p.y);g.rotate(a);g.strokeStyle='#ead29b90';g.lineWidth=5;g.beginPath();g.moveTo(-13,-12);g.lineTo(0,0);g.lineTo(-13,12);g.stroke();g.restore();}
// Human mining compound. Side service yards occupy non-buildable scenery;
// the original central dock stays clear for the refinery, miners and construction.
const floor=await loadImage(path.join(source,'terrain/t_13.png')),floorTile=createCanvas(128,128);floorTile.getContext('2d').drawImage(floor,0,0,128,128,0,0,128,128);
g.fillStyle=g.createPattern(floorTile,'repeat');g.fillRect(570,2210,1164,510);g.fillStyle='#18282c66';g.fillRect(570,2210,1164,510);
g.strokeStyle='#768281';g.lineWidth=6;g.beginPath();g.moveTo(1020,2214);g.lineTo(574,2214);g.lineTo(574,2716);g.lineTo(1730,2716);g.lineTo(1730,2214);g.lineTo(1260,2214);g.stroke();
// Clear north entrance and a through lane leading to the unloading dock.
// Feather road material into concrete; no stripe or curb crosses the entrance.
const transition=createCanvas(...L.size),tg=transition.getContext('2d');tg.strokeStyle=tg.createPattern(ground,'no-repeat');tg.lineWidth=L.roadWidth;tg.lineCap='round';tg.lineJoin='round';tg.beginPath();L.route.slice(L.approachStart).forEach((p,i)=>tg[i?'lineTo':'moveTo'](p.x,p.y));tg.stroke();tg.globalCompositeOperation='destination-in';const fade=tg.createLinearGradient(0,2210,0,2340);fade.addColorStop(0,'#fff');fade.addColorStop(1,'#fff0');tg.fillStyle=fade;tg.fillRect(0,0,...L.size);g.save();g.beginPath();g.rect(570,2210,1164,510);g.clip();g.drawImage(transition,0,0);g.restore();
g.strokeStyle='#c0a254';g.lineWidth=3;g.setLineDash([18,18]);for(const x of [1055,1249]){g.beginPath();g.moveTo(x,2235);g.lineTo(x,2690);g.stroke();}g.setLineDash([]);
const placeNative=async(name,x,y)=>{const im=await native(name);if(name==='jidicheku2'){const q=im.getContext('2d');q.resetTransform();q.clearRect(113,0,47,35);q.clearRect(43,0,70,30);}g.drawImage(im,x-im.width/2,y-im.height/2,im.width,im.height);};
for(const [name,x,y]of [['shop',680,2310],['cartoon_item04',685,2480],['cartoon_item03',690,2620],['jidicheku2',L.playerStart.x,L.playerStart.y],['cartoon_item01',1620,2550],['cartoon_item02',1630,2670],['tiekuai',610,2505],['tiekuai',610,2575],['youtong',760,2600],['youtong',760,2660]])await placeNative(name,x,y);
// Reuse the giant brain insect's original emergence burrow at the deepest point.

// Continuous atmospheric depth: deepest rock is cool and dark, upper rim stays sunlit.
const depth=g.createRadialGradient(1152,1120,40,1152,1120,1080);depth.addColorStop(0,'#02060bd9');depth.addColorStop(.28,'#09111b88');depth.addColorStop(.58,'#14202b40');depth.addColorStop(1,'#c3aa6500');g.fillStyle=depth;g.fillRect(0,0,...L.size);
// A fractured impact rim surrounds the organic breach, with the south exit open.
const crater=await loadImage(path.resolve(R,'../../source-art/thunder-raid-asteroid/crater.png'));
g.fillStyle='#030710';g.beginPath();g.ellipse(L.center.x,L.center.y-20,170,90,0,0,Math.PI*2);g.fill();
g.drawImage(crater,L.center.x-230,L.center.y-180,460,300);
const burrow=await loadImage(path.join(R,'assets/giant-brain-burrow.png'));
// Preserve the organic lip; the opening has receding strata and an unlit shaft,
// rather than a flat brown floor. All painting is clipped inside the native mouth.
g.save();g.translate(L.center.x-135,L.center.y-82);g.scale(270/burrow.width,165/burrow.height);g.drawImage(burrow,0,0);
g.beginPath();g.moveTo(111,72);g.bezierCurveTo(125,48,158,54,194,69);g.bezierCurveTo(243,79,282,100,291,126);g.bezierCurveTo(300,149,274,162,243,151);g.bezierCurveTo(206,144,169,125,137,107);g.bezierCurveTo(115,96,105,83,111,72);g.clip();
const shaft=g.createLinearGradient(135,56,217,151);shaft.addColorStop(0,'#354049');shaft.addColorStop(.28,'#1b2229');shaft.addColorStop(.62,'#070b12');shaft.addColorStop(1,'#010205');g.fillStyle=shaft;g.fillRect(95,40,210,130);
for(let i=0;i<5;i++){g.strokeStyle=['#7b746044','#64707740','#46566238','#33445330','#22303b25'][i];g.lineWidth=3-i*.35;g.beginPath();g.ellipse(200+i*3,104+i*4,92-i*12,40-i*5,.36,0,Math.PI*2);g.stroke();}
for(let i=0;i<9;i++){const x=118+i*18;g.strokeStyle='#020407aa';g.lineWidth=2;g.beginPath();g.moveTo(x,52+(i%3)*6);g.bezierCurveTo(x+5,77,x+12,99,x+28,128);g.stroke();}
const abyss=g.createRadialGradient(221,128,6,215,116,66);abyss.addColorStop(0,'#000106');abyss.addColorStop(.55,'#010309f5');abyss.addColorStop(1,'#02050b00');g.fillStyle=abyss;g.fillRect(100,45,210,125);g.restore();
// Native egg clusters frame the breach, with an open southern emergence lane.
const nests=require('../shared/insect-nest-art'),nestPages=await Promise.all(nests.pages.map(f=>loadImage(path.join(R,'assets',f)))),eggs=[];
let eggSeed=404;const eggRand=()=>((eggSeed=(eggSeed*1664525+1013904223)>>>0)/4294967296);
for(let i=0;i<11;i++){const a=Math.PI*.85+i/10*Math.PI*1.3+(eggRand()-.5)*.16,r=125+eggRand()*24;eggs.push({x:L.center.x+Math.cos(a)*r,y:L.center.y+Math.sin(a)*(70+eggRand()*16),id:i%3===0?914101:914100});if(i===2||i===6||i===9)eggs.push({x:L.center.x+Math.cos(a)*(r+25),y:L.center.y+Math.sin(a)*95,id:914100});}
// Extra clusters conceal the exposed lower rim where the spiral begins.
for(const [i,[x,y]]of [[-110,88],[-80,110],[-52,124],[58,126],[89,108],[119,86]].entries())eggs.push({x:L.center.x+x,y:L.center.y+y,id:i%2?914100:914101});
for(const e of eggs.sort((a,b)=>a.y-b.y)){const frames=nests.groups[e.id].anim.stand[1],f=nests.frames[frames[Math.floor(eggRand()*frames.length)]],scale=.8;g.fillStyle='#070b0c55';g.beginPath();g.ellipse(e.x,e.y+10,23,8,0,0,Math.PI*2);g.fill();g.drawImage(nestPages[f.page],f.x,f.y,f.w,f.h,e.x+f.ox*scale,e.y+f.oy*scale,f.w*scale,f.h*scale);}
g.font='bold 52px MineLabel';g.textAlign='center';g.fillStyle='#d2bf8b';g.fillText('04',900,2680);
// Composite the asteroid independently of its old rectangular terrain canvas.
const bounds=L.terrainBounds,renderScale=.8,out=createCanvas(Math.ceil(bounds.w*renderScale),Math.ceil(bounds.h*renderScale)),o=out.getContext('2d');
o.scale(renderScale,renderScale);o.translate(-bounds.x,-bounds.y);
const face=await loadImage(path.resolve(R,'../../source-art/thunder-raid-asteroid/cliff-face-v2.png'));
const edgeBottom=x=>{let y=-Infinity;for(let i=0;i<L.groundPerimeter.length;i++){const a=L.groundPerimeter[i],b=L.groundPerimeter[(i+1)%L.groundPerimeter.length];if((a.x<=x&&b.x>x)||(b.x<=x&&a.x>x))y=Math.max(y,a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x));}return y;};
for(let x=110;x<2240;x+=4){const bottom=edgeBottom(x+2);if(!Number.isFinite(bottom))continue;o.drawImage(face,(x-110)/2130*face.width,0,4/2130*face.width,face.height,x,bottom-95,4,380);}
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
for(const side of [-1,1])for(let i=0;i<5;i++){
 const width=440+[15,65,-10,30,5][i],height=width*ridge.height/ridge.width,x=side<0?80+[20,-15,45,0,25][i]:L.size[0]-70-[5,40,-20,25,0][i],y=190+i*510+[0,35,-15,20,0][i];
 o.save();o.translate(x,y);o.scale(side<0?1:-1,1);o.drawImage(ridge,-width*.5,-height*.5,width,height);o.restore();
}
// Upright horizontal ridge, shared with Iron Hunter: no rotation or mirroring.
const northRidge=await loadImage(path.resolve(R,'../../source-art/iron-alien/north-ridge-upright.png'));
for(const [x,y,w,h]of [[65,-40,800,350],[710,-55,810,365],[1370,-30,850,350]])o.drawImage(northRidge,x,y,w,h);
// Exact 8-bit alpha mask: narrow mountain tips and cliff notches remain transparent.
const rgba=o.getImageData(0,0,out.width,out.height).data,zlib=require('node:zlib'),scan=Buffer.alloc((out.width+1)*out.height);
for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++)scan[y*(out.width+1)+x+1]=rgba[(y*out.width+x)*4+3];
const chunk=(name,data)=>{const type=Buffer.from(name),b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length);type.copy(b,4);data.copy(b,8);b.writeUInt32BE(zlib.crc32(Buffer.concat([type,data])),data.length+8);return b;},header=Buffer.alloc(13);header.writeUInt32BE(out.width,0);header.writeUInt32BE(out.height,4);header[8]=8;header[9]=3;
fs.writeFileSync(path.join(R,'assets/mine4-mask.png'),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('PLTE',Buffer.alloc(768,255)),chunk('tRNS',Buffer.from(Array.from({length:256},(_,i)=>i))),chunk('IDAT',zlib.deflateSync(scan,{level:9})),chunk('IEND',Buffer.alloc(0))]));
const encoded=out.toBuffer('image/jpeg',68);fs.writeFileSync(path.join(R,'assets/mine4-terrain.jpg'),encoded);
// Review image shows the actual alpha before JPEG/mask separation.
fs.writeFileSync(path.resolve(R,'../../work/mine4-asteroid-preview.png'),out.toBuffer('image/png'));
console.log('Mine asteroid:',out.width,out.height,encoded.length,'bytes, JPEG68');
})();
