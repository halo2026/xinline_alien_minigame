const {createCanvas,loadImage}=require('@napi-rs/canvas'),fs=require('fs'),path=require('path'),L=require('../shared/iron-alien-layout'),R=path.resolve(__dirname,'..');
(async()=>{const b=L.terrainBounds,s=.8,out=createCanvas(Math.ceil(b.w*s),Math.ceil(b.h*s)),o=out.getContext('2d');o.scale(s,s);o.translate(-b.x,-b.y);
const surface=createCanvas(...L.size),g=surface.getContext('2d'),desert=await loadImage(path.join(R,'source-art/airship-roads/desert.jpg')),ridge=await loadImage(path.resolve(R,'../../source-art/thunder-raid-asteroid/ridge.png')),cliff=await loadImage(path.resolve(R,'../../source-art/thunder-raid-asteroid/cliff-face-v2.png'));
let seed=3737;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
// Overlap feathered terrain samples from the mothership's source desert; no roads copied.
g.fillStyle='#867554';g.fillRect(0,0,...L.size);const patch=createCanvas(240,240),pc=patch.getContext('2d'),fade=pc.createRadialGradient(120,120,65,120,120,120);fade.addColorStop(0,'white');fade.addColorStop(1,'#fff0');
for(let y=-120;y<L.size[1];y+=100)for(let x=-120;x<L.size[0];x+=100){pc.clearRect(0,0,240,240);pc.save();pc.translate(120,120);pc.rotate(rand()*6.28);pc.drawImage(desert,desert.width*.45,desert.height*.33,180,180,-170,-170,340,340);pc.restore();pc.globalCompositeOperation='destination-in';pc.fillStyle=fade;pc.fillRect(0,0,240,240);pc.globalCompositeOperation='source-over';g.drawImage(patch,x,y);}
g.fillStyle='#25232235';g.fillRect(0,0,...L.size);
const trace=(ctx,points)=>{ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x,p.y));},stroke=(r,w,color)=>{trace(g,r);g.lineWidth=w;g.strokeStyle=color;g.lineCap='round';g.lineJoin='round';g.stroke();};
// Broad dust roads around a central raised build terrace, matching the reference topology.
const roadTexture=createCanvas(...L.size);roadTexture.getContext('2d').drawImage(surface,0,0);
// A low continuous rock shelf supports the central tower terrace.
g.save();g.beginPath();g.ellipse(1030,690,272,202,-.08,0,Math.PI*2);g.fillStyle='#514431';g.shadowColor='#1c171952';g.shadowBlur=12;g.shadowOffsetY=14;g.fill();g.shadowColor='transparent';g.translate(0,-10);g.beginPath();g.ellipse(1030,690,272,202,-.08,0,Math.PI*2);g.fillStyle=g.createPattern(roadTexture,'no-repeat');g.fill();g.strokeStyle='#dec59855';g.lineWidth=3;g.stroke();g.restore();
const road=(width,color)=>{g.beginPath();for(const r of L.routes){g.moveTo(r[0].x,r[0].y);for(const q of r.slice(1))g.lineTo(q.x,q.y);}g.lineWidth=width;g.strokeStyle=color;g.lineCap='round';g.lineJoin='round';g.stroke();};
road(164,'#54493665');road(151,'#b7a57a');road(140,'#af9b72');g.save();g.globalAlpha=.5;road(142,g.createPattern(roadTexture,'no-repeat'));g.restore();
for(let i=0;i<12500;i++){const x=rand()*1920,y=rand()*1344,road=L.roadDistance(x,y)<68;g.fillStyle=road?(i%3?'#5c4d3020':'#f4d4a327'):(i%3?'#312b2220':'#e5c88e22');g.beginPath();g.ellipse(x,y,1+rand()*5,.6+rand()*2,rand()*3,0,6.28);g.fill();}
// Native rocks sit on the outer border, leaving central and outer tower sites clear.
const bottom=x=>{let y=-Infinity;for(let i=0;i<L.polygon.length;i++){const a=L.polygon[i],p=L.polygon[(i+1)%L.polygon.length];if(x>=Math.min(a.x,p.x)&&x<=Math.max(a.x,p.x)&&a.x!==p.x)y=Math.max(y,a.y+(p.y-a.y)*(x-a.x)/(p.x-a.x));}return y;};
for(let x=85;x<1870;x+=4){const y=bottom(x);if(!Number.isFinite(y))continue;const sx=((x*1.1)% (cliff.width-5));o.drawImage(cliff,sx,0,4,cliff.height,x,y-65,4,265);}
const land=createCanvas(out.width,out.height),lc=land.getContext('2d');lc.scale(s,s);lc.translate(-b.x,-b.y);lc.save();trace(lc,L.polygon);lc.closePath();lc.clip();lc.drawImage(surface,0,0);lc.restore();const im=lc.getImageData(0,0,land.width,land.height);
for(let px=0;px<land.width;px++){const x=(px+.5)/s+b.x,edge=bottom(x);if(!Number.isFinite(edge))continue;for(let py=Math.max(0,Math.floor((edge-64-b.y)*s));py<Math.min(land.height,(edge-b.y)*s);py++){const y=(py+.5)/s+b.y,t=Math.max(0,Math.min(1,(edge-y-5-7*Math.sin(x*.09)-4*Math.sin(x*.33))/38));im.data[(py*land.width+px)*4+3]*=t*t*(3-2*t);}}
lc.putImageData(im,0,0);o.drawImage(land,b.x,b.y,b.w,b.h);
// Border mountains: horizontal overlapping ridges across the north, vertical along the sides.
const ridgeAt=(x,y,w,h,angle=0,flip=false)=>{o.save();o.translate(x,y);o.rotate(angle);if(flip)o.scale(-1,1);o.drawImage(ridge,-w/2,-h/2,w,h);o.restore();};
const north=await loadImage(path.resolve(R,'../../source-art/iron-alien/north-ridge-upright.png'));
// Preserve upright peaks: no rotation or mirroring, overlapping horizontal chains.
for(const [x,y,w,h]of [[85,-45,710,315],[640,-60,730,330],[1190,-30,670,300]])o.drawImage(north,x,y,w,h);
for(const side of [0,1])for(let y=335;y<=1070;y+=190){if(y>430&&y<850)continue;ridgeAt(side?1790:145,y,205,350,0,!!side);}
// Meteor impact rim surrounds the shared burrow entrance; the cave itself is drawn in foreground layers.
const crater=await loadImage(path.resolve(R,'../../source-art/thunder-raid-asteroid/crater.png'));
o.drawImage(crater,1580,510,310,238);
const rgba=o.getImageData(0,0,out.width,out.height),mask=createCanvas(out.width,out.height),mc=mask.getContext('2d');for(let i=0;i<rgba.data.length;i+=4)rgba.data[i]=rgba.data[i+1]=rgba.data[i+2]=255;mc.putImageData(rgba,0,0);fs.writeFileSync(path.join(R,'assets/iron-alien-mask.png'),mask.toBuffer('image/png'));fs.writeFileSync(path.join(R,'assets/iron-alien-terrain.jpg'),out.toBuffer('image/jpeg',68));fs.writeFileSync(path.resolve(R,'../../work/iron-alien/map.png'),out.toBuffer('image/png'));console.log(out.width,out.height);})();
