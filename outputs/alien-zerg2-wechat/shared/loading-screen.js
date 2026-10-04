(function(){
function draw(ctx,image,w,h,progress=0,label='战队正在星际投送中。。。',animation={}){
 ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.fillStyle='#060b14';ctx.fillRect(0,0,w,h);
 if(image?.width){const fit=Math.min(w/image.width,h/image.height),iw=image.width*fit,ih=image.height*fit,x=(w-iw)/2,y=Math.max(0,(h-ih)/2-(h>w?17:0));ctx.drawImage(image,x,y,iw,ih);
 // Fade from the actual image edge, not the screen edge: contain-fit leaves different margins on each phone.
 const fade=(x0,y0,x1,y1,rx,ry,rw,rh)=>{const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'#060b14');g.addColorStop(.35,'#060b14aa');g.addColorStop(.72,'#060b1440');g.addColorStop(1,'#060b1400');ctx.fillStyle=g;ctx.fillRect(rx,ry,rw,rh);};
 const fy=Math.min(76,ih*.12),fx=Math.min(64,iw*.14);
 const topFade=Math.min(48,ih*.075);fade(0,y,0,y+topFade,x,y,iw,topFade);
 fade(0,y+ih,0,y+ih-fy,x,y+ih-fy,iw,fy);
 if(x>1){fade(x,0,x+fx,0,x,y,fx,ih);fade(x+iw,0,x+iw-fx,0,x+iw-fx,y,fx,ih);}
 }
 const shade=ctx.createLinearGradient(0,h*.72,0,h);shade.addColorStop(0,'#050b1400');shade.addColorStop(1,'#050b14f5');ctx.fillStyle=shade;ctx.fillRect(0,h*.72,w,h*.28);
 const bw=Math.min(310,w*.76),x=(w-bw)/2,y=h-Math.max(65,h*.085),p=Math.max(0,Math.min(1,progress));// Beveled armored housing with a recessed, segmented energy channel.
 const panel=(px,py,pw,ph,cut)=>{ctx.beginPath();ctx.moveTo(px+cut,py);ctx.lineTo(px+pw-cut,py);ctx.lineTo(px+pw,py+cut);ctx.lineTo(px+pw,py+ph-cut);ctx.lineTo(px+pw-cut,py+ph);ctx.lineTo(px+cut,py+ph);ctx.lineTo(px,py+ph-cut);ctx.lineTo(px,py+cut);ctx.closePath();};
 panel(x-3,y-10,bw+6,30,7);ctx.fillStyle='#02070deb';ctx.fill();
 const metal=ctx.createLinearGradient(0,y-9,0,y+17);metal.addColorStop(0,'#a6bfcb');metal.addColorStop(.16,'#526d7d');metal.addColorStop(.48,'#263c4d');metal.addColorStop(.78,'#102333');metal.addColorStop(1,'#668b9e');panel(x,y-9,bw,26,6);ctx.fillStyle=metal;ctx.fill();ctx.strokeStyle='#819ca8';ctx.lineWidth=1;ctx.stroke();
 panel(x+6,y-4,bw-12,16,3);ctx.fillStyle='#030b13';ctx.fill();ctx.strokeStyle='#101c26';ctx.stroke();
 const ix=x+10,iw=bw-20,iy=y-1,ih=10;
 ctx.fillStyle='#102736';ctx.fillRect(ix,iy,iw,ih);
 const energy=ctx.createLinearGradient(0,iy,0,iy+ih);energy.addColorStop(0,'#c3f6ff');energy.addColorStop(.25,'#59c8ec');energy.addColorStop(.6,'#258bb6');energy.addColorStop(1,'#105674');ctx.fillStyle=energy;ctx.fillRect(ix,iy,iw*p,ih);
 // Fixed cell separators avoid per-pixel geometry and preserve exact progress.
 ctx.fillStyle='#071722';for(let i=1;i<24;i++)ctx.fillRect(ix+iw*i/24,iy,2,ih);
 for(const dx of [x+3,x+bw-5]){ctx.fillStyle='#e7bb69';ctx.fillRect(dx,y,2,7);}
 ctx.strokeStyle='#bcdce980';ctx.beginPath();ctx.moveTo(x+9,y-7);ctx.lineTo(x+bw-9,y-7);ctx.stroke();
 if(p>0){const edge=ix+iw*p;ctx.fillStyle='#ddfaff';ctx.fillRect(Math.max(ix,edge-2),iy,Math.min(2,iw*p),ih);}
 ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillStyle='#e9e4d3';ctx.fillText(label,w/2,y-57);ctx.font='11px sans-serif';ctx.fillStyle='#9ab2c1';ctx.fillText(Math.round(p*100)+'%',w/2,y+36);if(animation.ship?.width){const ship=animation.ship,sw=Math.min(72,w*.18),sh=sw*ship.height/ship.width,head=x+10+(bw-20)*p,t=animation.time||0,cy=y-12+Math.sin(t*3)*1.2;
 ctx.drawImage(ship,head-sw/2,cy-sh/2,sw,sh);
 // Nozzles follow the reference's underside perspective; jets brake vertically downward.
 for(const [nx,ny,phase,amber] of [[-.336,.07,0,false],[.18,.005,2,false],[-.07,.164,4,true]]){const ex=head+sw*nx,ey=cy+sh*ny,len=sw*(amber?.16:.30)*(1+.15*Math.sin(t*24+phase)+.07*Math.sin(t*39)),r=amber?1.5:2.6,g=ctx.createLinearGradient(ex,ey,ex,ey+len);g.addColorStop(0,amber?'#fff4d5':'#f1fcff');g.addColorStop(.35,amber?'#ffac56ee':'#6dc6ffff');g.addColorStop(1,amber?'#ef793000':'#3589ff00');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(ex-r,ey);ctx.quadraticCurveTo(ex-r*.7,ey+len*.6,ex,ey+len);ctx.quadraticCurveTo(ex+r*.7,ey+len*.6,ex+r,ey);ctx.closePath();ctx.fill();}
 }
 ctx.restore();
}
const api={draw};if(typeof module!=='undefined')module.exports=api;else globalThis.AlienLoading=api;
})();
