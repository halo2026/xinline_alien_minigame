(function(){
const fract=x=>x-Math.floor(x),rand=n=>fract(Math.sin(n*127.1+311.7)*43758.5453);
// A small cached soft-star sprite replaces 85 new radial gradients per frame.
function starSprite(v){if(v.starGlow!==undefined)return v.starGlow;try{const im=typeof wx!=='undefined'&&wx.createOffscreenCanvas?wx.createOffscreenCanvas({type:'2d',width:32,height:32}):typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(32,32):typeof document!=='undefined'?document.createElement('canvas'):null;if(!im)return v.starGlow=null;im.width=im.height=32;const c=im.getContext('2d'),g=c.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'#b3cef2');g.addColorStop(1,'#b3cef200');c.fillStyle=g;c.fillRect(0,0,32,32);return v.starGlow=im;}catch(e){return v.starGlow=null;}}
const starSeeds=Array.from({length:255},(_,j)=>{const layer=Math.floor(j/85),i=j%85,seed=i+layer*997;return {layer,i,seed,x:rand(seed),y:rand(seed+65),r:(.4+rand(seed+82)*1.1)*(layer===0?1.8:1)};});
function stars(v){const c=v.ctx,w=v.w,h=v.h,t=v.game.time,cam=v.camera;c.fillStyle='#030712';c.fillRect(0,0,w,h);
 if(v.images.space){const img=v.images.space,scale=Math.max(w/img.width,h/img.height)*1.15,sw=img.width*scale,sh=img.height*scale;c.drawImage(img,(w-sw)/2-Math.sin(cam.x*.0006)*20,(h-sh)/2-Math.sin(cam.y*.0006)*15,sw,sh);}
 const clouds=[[.18,.25,.7,'#19335b'],[.78,.65,.6,'#332744']];for(const [x,y,size,color]of clouds){const cx=x*w-cam.x*.018,cy=y*h-cam.y*.014,r=Math.max(w,h)*size,g=c.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,color);g.addColorStop(1,'#03071200');c.fillStyle=g;c.fillRect(0,0,w,h);}
 const stamp=starSprite(v);for(const q of starSeeds){const {layer,i,seed,r}=q,x=((q.x*w-cam.x*(.018+layer*.04))%w+w)%w,y=((q.y*h-cam.y*(.018+layer*.04))%h+h)%h;c.globalAlpha=.28+layer*.16+Math.sin(t*.3+seed)*.08;if(layer===0){if(stamp)c.drawImage(stamp,x-r*3,y-r*3,r*6,r*6);else{const glow=c.createRadialGradient(x,y,0,x,y,r*3);glow.addColorStop(0,'#b3cef2');glow.addColorStop(1,'#b3cef200');c.fillStyle=glow;c.fillRect(x-r*3,y-r*3,r*6,r*6);}}else{c.fillStyle=i%7?'#bddef5':'#f5cdaa';c.fillRect(x,y,r,r);}}c.globalAlpha=1;
 debris(v);
}
// Original random-maze near objects, rendered behind the entire playable asteroid.
function debris(v){const c=v.ctx,w=v.w,h=v.h,t=v.game.time||0,cam=v.camera;
 c.save();
 if(v.images.debris)for(let layer=0;layer<2;layer++)for(let i=0;i<12;i++){
  const seed=809+layer*37+i,spanX=w+160,spanY=h+160,parallax=layer?.32:.12;
  const x=((rand(seed)*spanX-cam.x*parallax+t*(layer?1.8:.7))%spanX+spanX)%spanX-80;
  const y=((rand(seed+31)*spanY-cam.y*parallax+t*(rand(seed+7)-.5)*1.6)%spanY+spanY)%spanY-80;
  const size=(layer?30:14)+rand(seed+3)*(layer?35:16),frame=i%10;
  c.save();c.translate(x,y);c.rotate(rand(seed+4)*6.28+t*(rand(seed+2)-.5)*.035);
  c.globalAlpha=layer?.8:.4;c.drawImage(v.images.debris,frame*64,0,64,64,-size/2,-size/2,size,size);c.restore();
 }
 // Short, infrequent streaks with a fading tail; no combat or collision effects.
 const cycle=Math.floor(t/11),age=t-cycle*11;
 if(age>2&&age<3.6){const u=(age-2)/1.6,seed=cycle+4200,x=rand(seed)*w*.65+u*w*.45,y=rand(seed+1)*h*.55+u*h*.32;
  const dx=95,dy=55,g=c.createLinearGradient(x-dx,y-dy,x,y);g.addColorStop(0,'#9bcfff00');g.addColorStop(.8,'#a3cfff88');g.addColorStop(1,'#e8f7ff');
  c.globalAlpha=Math.sin(u*Math.PI)*.8;c.strokeStyle=g;c.lineWidth=1.4;c.beginPath();c.moveTo(x-dx,y-dy);c.lineTo(x,y);c.stroke();
 }
 c.restore();
}
function rim(v,size){
 const c=v.ctx,[w,h]=size,points=[];
 for(let side=0;side<4;side++)for(let j=0;j<18;j++){const t=j/17,d=(side===1||side===2?6:18)+rand(side*18+j+3)*(side===1||side===2?18:30);points.push(side===0?[t*w,-d]:side===1?[w+d,t*h]:side===2?[(1-t)*w,h+d]:[-d,(1-t)*h]);}
 const path=(offset=0)=>{c.beginPath();points.forEach(([x,y],i)=>c[i?'lineTo':'moveTo'](x,y+offset));c.closePath();};
 const texture=()=>{if(v.images.rock){for(let y=-192;y<h+256;y+=384)for(let x=-192;x<w+256;x+=384)c.drawImage(v.images.rock,x,y,384,384);}else{c.fillStyle='#372d27';c.fillRect(-192,-192,w+384,h+448);}};
 c.save();
 // Cut actual holes through every rock layer; the space background remains visible.
 c.beginPath();c.rect(-512,-512,w+1024,h+1024);
 for(let i=0;i<30;i++){const side=i%4,t=.07+rand(i+201)*.86,d=12+rand(i+52)*12,x=side===0?t*w:side===1?w+d:side===2?t*w:-d,y=side===0?-d:side===1?t*h:side===2?h+d:t*h,r=7+rand(i+41)*10;
 c.moveTo(x+r,y);for(let j=1;j<=7;j++){const a=-j*Math.PI*2/7,rr=r*(.7+rand(i*7+j)*.3);c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*1.7);}c.closePath();}
 for(let i=0;i<24;i++){const side=i%4,t=.1+rand(i+701)*.8,along=t*(side%2?h:w),pts=[[along-25,120],[along-14,32],[along-6,3],[along+18,22],[along+30,120]];
 const mapped=pts.map(([a,d])=>side===0?[a,-d]:side===1?[w+d,a]:side===2?[a,h+d]:[-d,a]);if(side===0||side===3)mapped.reverse();mapped.forEach(([x,y],j)=>c[j?'lineTo':'moveTo'](x,y));c.closePath();}
 c.clip('evenodd');
 // Lower fractured sidewall gives the asteroid physical thickness.
 path(12);c.save();c.clip();texture();c.fillStyle='#060b14a8';c.fillRect(-192,-192,w+384,h+448);c.restore();
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];c.beginPath();c.moveTo(...a);c.lineTo(...b);c.lineTo(b[0],b[1]+12);c.lineTo(a[0],a[1]+12);c.closePath();c.fillStyle=i%3?'#090e183d':'#b09a7922';c.fill();c.strokeStyle='#080b1244';c.lineWidth=1;c.stroke();}
 path();c.save();c.clip();texture();c.restore();c.strokeStyle='#99847277';c.lineWidth=2;c.stroke();
 // Sparse detached chunks in space, using the same rock material rather than flat circles.
 for(let i=0;i<32;i++){const side=i%4,t=rand(i+91),d=100+rand(i+33)*115,x=side===0?t*w:side===1?w+d:side===2?t*w:-d,y=side===0?-d:side===1?t*h:side===2?h+d:t*h,r=3+rand(i+5)*13;c.save();c.translate(x,y);c.rotate(rand(i)*6.28);c.beginPath();for(let j=0;j<6;j++){const a=j*Math.PI/3,rr=r*(.65+rand(i*6+j)*.5);c[j?'lineTo':'moveTo'](Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.clip();if(v.images.rock)c.drawImage(v.images.rock,rand(i+10)*400,rand(i+20)*400,100,100,-r,-r,r*2,r*2);c.fillStyle='#08102055';c.fillRect(-r,-r,r*2,r*2);c.restore();}
 c.restore();
}
function ambience(v,size){const c=v.ctx,[w,h]=size;c.save();const factory=v.game.refinery;for(const [dx,dy]of [[-55,20],[60,10]]){const x=factory.x+dx,y=factory.y+dy,g=c.createRadialGradient(x,y,0,x,y,65);g.addColorStop(0,'#69e7ff28');g.addColorStop(1,'#69e7ff00');c.fillStyle=g;c.fillRect(x-65,y-65,130,130);}c.restore();}
const api={stars,rim,ambience};if(typeof module!=='undefined')module.exports=api;else globalThis.AlienSpace=api;
})();
