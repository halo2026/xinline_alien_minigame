const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas'),fs=require('fs'),path=require('path'),R=path.resolve(__dirname,'..'),L=require('../shared/thunder-raid-layout').source,A=require('../shared/defense-art');
(async()=>{GlobalFonts.registerFromPath('/System/Library/Fonts/STHeiti Medium.ttc','Raid');const pad=480,scale=.8,bounds={x:-pad,y:-pad,w:L.size[0]+pad*2,h:L.size[1]+pad*2},c=createCanvas(Math.ceil(bounds.w*scale),Math.ceil(bounds.h*scale)),g=c.getContext('2d'),silhouette=createCanvas(c.width,c.height),sg=silhouette.getContext('2d');for(const ctx of [g,sg]){ctx.scale(scale,scale);ctx.translate(pad,pad);}sg.beginPath();(L.groundPerimeter||L.perimeter).forEach((p,i)=>sg[i?'lineTo':'moveTo'](p.x,p.y));sg.closePath();sg.fillStyle='#fff';sg.fill();
const source=process.env.MINE_NATIVE_SOURCE||'/Users/wangxin/Documents/projects/source/data';
// Use the same native rock and gravel sheets as the kryptonite-vein campaign.
const tile=async(name,filter)=>{const im=await loadImage(path.join(source,'terrain',name)),t=createCanvas(256,256),q=t.getContext('2d');q.filter=filter;q.drawImage(im,im.width===512?256:0,0,256,256,0,0,256,256);return t;};
const rock=await tile('t_05.png','saturate(38%) brightness(68%)'),gravel=await tile('t_15.png','saturate(40%) brightness(84%)'),floor=await tile('t_13.png','brightness(75%)');
// Draw a continuous rock cross-section underneath the ground, following each local edge height.
const face=await loadImage(path.resolve(R,'../../source-art/thunder-raid-asteroid/cliff-face-v2.png'));
const edgeBottom=x=>{let y=-Infinity;for(let i=0;i<L.groundPerimeter.length;i++){const a=L.groundPerimeter[i],b=L.groundPerimeter[(i+1)%L.groundPerimeter.length];if((a.x<=x&&b.x>x)||(b.x<=x&&a.x>x))y=Math.max(y,a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x));}return y;};
for(let x=60;x<L.size[0]-60;x+=4){const bottom=edgeBottom(x+2);if(!Number.isFinite(bottom))continue;const sx=(x-60)/(L.size[0]-120)*face.width,sw=4/(L.size[0]-120)*face.width;for(const ctx of [g,sg])ctx.drawImage(face,sx,0,sw,face.height,x,bottom-100,4,440);}
g.save();g.beginPath();L.groundPerimeter.forEach((p,i)=>g[i?'lineTo':'moveTo'](p.x,p.y));g.closePath();g.clip();
g.fillStyle=g.createPattern(rock,'repeat');g.fillRect(bounds.x,bounds.y,bounds.w,bounds.h);
// Both paths share one feathered mask, so the fork has no painted seam or curb.
const road=createCanvas(c.width,c.height),r=road.getContext('2d'),mask=createCanvas(c.width,c.height),m=mask.getContext('2d');r.scale(scale,scale);r.translate(pad,pad);r.fillStyle=r.createPattern(gravel,'repeat');r.fillRect(0,0,...L.size);m.scale(scale,scale);m.translate(pad,pad);m.filter='blur(4px)';m.strokeStyle='#fff';m.lineWidth=L.roadWidth;m.lineCap='round';m.lineJoin='round';for(const route of L.routes){m.beginPath();route.forEach((p,i)=>m[i?'lineTo':'moveTo'](p.x,p.y));m.stroke();}r.resetTransform();r.globalCompositeOperation='destination-in';r.drawImage(mask,0,0);g.drawImage(road,bounds.x,bounds.y,bounds.w,bounds.h);
g.restore();
// Generated asteroid ridges are baked into the terrain, avoiding extra runtime textures.
const cliff=await loadImage(path.resolve(R,'../../source-art/thunder-raid-asteroid/ridge.png'));
for(const side of [-1,1])for(let layer=0;layer<2;layer++)for(let i=0;i<4;i++){
 const phase=i*1.9+(side<0?0:1.1),width=layer?570:660,height=width*cliff.height/cliff.width,inset=layer?-80:-120,y=-220+i*680+(layer?300:0),x=side<0?inset:L.size[0]-inset;
 for(const ctx of [g,sg]){ctx.save();ctx.translate(x,y);ctx.scale(side<0?1:-1,1);ctx.drawImage(cliff,-width*.5,-height*.15,width,height);ctx.restore();}
}
// Broad horizontal ridges close the asteroid above the entrance and below both mines.
for(const bottom of [false])for(let i=0;i<4;i++){
 const width=550,height=width*cliff.height/cliff.width;
 for(const ctx of [g,sg]){ctx.save();ctx.translate(-20+i*520,bottom?2540:-70);ctx.rotate(bottom?-Math.PI/2:Math.PI/2);ctx.drawImage(cliff,-width/2,-height*.5,width,height);ctx.restore();}
}
const crater=await loadImage(path.resolve(R,'../../source-art/thunder-raid-asteroid/crater.png'));
for(const d of L.craters){g.save();g.translate(d.x,d.y);g.scale(d.width,d.width);g.beginPath();L.craterOutline.forEach(([x,y],i)=>g[i?'lineTo':'moveTo'](x,y));g.closePath();g.fillStyle='#030712';g.fill();g.drawImage(crater,-.5,-.5,1,1);g.restore();}
const pages=await Promise.all(A.pages.map(f=>loadImage(path.join(R,'assets',f))));for(const d of L.scenery.sort((a,b)=>a.y-b.y)){if(d.x<180||d.x>L.size[0]-180)continue;const f=A.frames['campaign-prop/'+d.id];g.drawImage(pages[f.page],f.x,f.y,f.w,f.h,d.x+f.ox*d.scale,d.y+f.oy*d.scale,(f.ow||f.w)*d.scale,(f.oh||f.h)*d.scale);}
// Mining ground has no decorative collectible-shaped crystals.
// Trace the union of the actual mountain sprites and ground, rather than cutting rock with a straight border.
const alpha=sg.getImageData(0,0,c.width,c.height).data,step=3,cw=Math.ceil(c.width/step),ch=Math.ceil(c.height/step),solid=(x,y)=>x>=0&&y>=0&&x<cw&&y<ch&&alpha[(Math.min(c.height-1,y*step)*c.width+Math.min(c.width-1,x*step))*4+3]>=140,edges=new Map();
const edge=(x,y,xx,yy)=>{const key=x+','+y;if(!edges.has(key))edges.set(key,[]);edges.get(key).push([xx,yy]);};
for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(solid(x,y)){if(!solid(x,y-1))edge(x,y,x+1,y);if(!solid(x+1,y))edge(x+1,y,x+1,y+1);if(!solid(x,y+1))edge(x+1,y+1,x,y+1);if(!solid(x-1,y))edge(x,y+1,x,y);}
const loops=[];while(edges.size){const start=edges.keys().next().value,points=[],first=start.split(',').map(Number);let current=first;for(let n=0;n<50000;n++){points.push(current);const key=current.join(','),next=edges.get(key);if(!next?.length)break;current=next.pop();if(!next.length)edges.delete(key);if(current.join(',')===start)break;}if(points.length>3)loops.push(points);}
const area=p=>Math.abs(p.reduce((a,q,i)=>{const r=p[(i+1)%p.length];return a+q[0]*r[1]-r[0]*q[1];},0));loops.sort((a,b)=>area(b)-area(a));
const simplify=p=>{if(p.length<3)return p;const a=p[0],b=p.at(-1),dx=b[0]-a[0],dy=b[1]-a[1];let index=0,best=0;for(let i=1;i<p.length-1;i++){const q=p[i],t=Math.max(0,Math.min(1,((q[0]-a[0])*dx+(q[1]-a[1])*dy)/(dx*dx+dy*dy||1))),d=Math.hypot(q[0]-a[0]-dx*t,q[1]-a[1]-dy*t);if(d>best){best=d;index=i;}}return best>1.2?[...simplify(p.slice(0,index+1)).slice(0,-1),...simplify(p.slice(index))]:[a,b];};
const loop=loops[0],half=Math.floor(loop.length/2),outline=[...simplify(loop.slice(0,half+1)).slice(0,-1),...simplify([...loop.slice(half),loop[0]]).slice(0,-1)].map(([x,y])=>({x:Math.round(x*step/scale-pad),y:Math.round(y*step/scale-pad)})),layoutFile=path.join(R,'shared/thunder-raid-layout.js');
let layout=fs.readFileSync(layoutFile,'utf8');layout=layout.replace(/const visualPerimeter=.*?;\n/, '');layout=layout.replace('const data={','const visualPerimeter='+JSON.stringify(outline)+';\nconst data={');fs.writeFileSync(layoutFile,layout);
// Keep the actual sprite alpha, including narrow notches and disconnected rock tips.
sg.resetTransform();sg.globalCompositeOperation='source-in';sg.fillStyle='#fff';sg.fillRect(0,0,c.width,c.height);
// Indexed white palette + per-entry alpha: lossless alpha, no redundant RGB texture data.
const zlib=require('node:zlib'),rgba=sg.getImageData(0,0,c.width,c.height).data,scan=Buffer.alloc((c.width+1)*c.height),palette=Buffer.alloc(768,255),transparency=Buffer.from(Array.from({length:256},(_,i)=>i));
for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)scan[y*(c.width+1)+1+x]=rgba[(y*c.width+x)*4+3];
const chunk=(name,data)=>{const type=Buffer.from(name),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);type.copy(out,4);data.copy(out,8);out.writeUInt32BE(zlib.crc32(Buffer.concat([type,data])),8+data.length);return out;},header=Buffer.alloc(13);header.writeUInt32BE(c.width,0);header.writeUInt32BE(c.height,4);header[8]=8;header[9]=3;
fs.writeFileSync(path.join(R,'assets/thunderraid-mask.png'),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('PLTE',palette),chunk('tRNS',transparency),chunk('IDAT',zlib.deflateSync(scan,{level:9})),chunk('IEND',Buffer.alloc(0))]));
const quality=82,buf=c.toBuffer('image/jpeg',quality);fs.writeFileSync(path.join(R,'assets/thunderraid-terrain.jpg'),buf);console.log('Raid terrain',c.width,c.height,buf.length,'quality',quality);

})();
