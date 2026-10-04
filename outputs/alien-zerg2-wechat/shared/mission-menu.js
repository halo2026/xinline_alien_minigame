(function(){
const build=typeof module!=='undefined'?require('./build-info'):globalThis.AlienBuild;
const missions=[
{id:'zerg',title:'异虫',source:'yxys_zerg_002',art:0,waves:10,objective:'守护精炼厂 · 第一幕1–10波 / 第二幕11–20波',runtime:true},
{id:'zerg1',title:'护矿使者',source:'yxys_zerg_001',art:7,waves:7,objective:'护送矿车 · 第一幕1–7波 / 第二幕8–14波',runtime:true},
{id:'snake3',title:'双头蛇窟Ⅲ',source:'yxys_snake_03',art:1,waves:7,objective:'守护基地 · 第一幕1–7波 / 第二幕8–14波',runtime:true},
{id:'airship3',title:'母舰Ⅲ',source:'yxys_airship_03',art:3,waves:7,objective:'守护基地 · 第一幕1–7波 / 第二幕8–14波',runtime:true},
{id:'greenstar',title:'氪石矿脉',source:'td_009_jmhj',art:6,waves:15,objective:'守护三座矿厂 · 第一幕1–15波 / 第二幕16–30波',runtime:true},
{id:'fish3',title:'母巢护卫Ⅲ',source:'yxys_fish_03',art:2,waves:8,objective:'守护基地 · 第一幕1–8波 / 第二幕9–16波',runtime:true},
{id:'fortress2',title:'空中堡垒Ⅱ',source:'yxys_mechanics_002',art:4,waves:9,objective:'守护基地 · 第一幕1–9波 / 第二幕10–18波',runtime:true},
{id:'scorpion2',title:'地狱魔蝎Ⅱ',source:'yxys_scorpion_02',art:5,waves:9,objective:'守护基地 · 第一幕1–9波 / 第二幕10–18波',runtime:true}];
function unlocked(progress,index){return index===0||progress.campaignClears?.[missions[index].id]===true||!!progress.campaignActs?.[missions[index].id]||progress.campaignClears?.[missions[index-1].id]===true;}
function recordClear(game,id){if(!missions.some(m=>m.id===id)||game.state!=='won')return false;const p=game.progress;p.campaignClears=p.campaignClears||{};if(p.campaignClears[id])return false;p.campaignClears[id]=true;p.campaignActs??={};p.campaignActs[id]={act:3,gold:game.gold||0,convoyLost:game.convoyLost||0};game.progressDirty=true;return true;}
class MissionMenu{
 constructor(view,onSelect,onResume=null){this.view=view;this.onSelect=onSelect;this.onResume=onResume;this.selected=Math.max(0,missions.findIndex((m,i)=>unlocked(view.game.progress,i)&&!view.game.progress.campaignClears?.[m.id]));this.scroll=0;this.animationTime=0;this.lastFrame=0;this.focus();}
 geometry(){const v=this.view,land=v.w>v.h,area={x:12,y:v.top+30,w:v.w-24,h:Math.max(170,v.h-v.top-182)},step=land?166:156;return {land,area,step,max:Math.max(0,(missions.length-1)*step+(land?72:138)-(land?area.w:area.h)*.62)};}
 focus(){const g=this.geometry();this.scroll=Math.max(0,Math.min(g.max,this.selected*g.step-(g.land?g.area.w:g.area.h)/2+70));}
 layout(){const {land,area,step}=this.geometry();return missions.map((m,i)=>{const cross=[.3,.7,.35,.7,.3,.7,.35,.7][i],cx=land?area.x+72+i*step-this.scroll:area.x+area.w*cross,cy=land?area.y+125:area.y+138+i*step-this.scroll;return {...m,index:i,cx,cy,x:cx-62,y:cy-58,w:124,h:138};});}
 resumeRect(){return {x:this.view.w-Math.min(204,this.view.w-132)-18,y:this.view.h-54,w:Math.min(204,this.view.w-132),h:36};}
 footer(){const v=this.view;return {x:18,y:v.h-145,w:v.w-36,h:128};}
 drawSpace(){
 const v=this.view,c=v.ctx,w=v.w,h=v.h,{land,max}=this.geometry(),now=Date.now();
 // Cap elapsed time so returning from a hidden app never jumps a meteor across the screen.
 this.animationTime+=this.lastFrame?Math.max(0,Math.min(.05,(now-this.lastFrame)/1000)):0;this.lastFrame=now;
 const t=this.animationTime,shift=this.scroll-max/2,dx=land?shift:0,dy=land?0:shift;
 const rand=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);},wrap=(n,span)=>(n%span+span)%span;
 c.save();c.fillStyle='#040914';c.fillRect(0,0,w,h);
 // Far field: overscan reserves enough image outside the viewport for the entire scroll range.
 const im=v.images.campaignSpace;if(im){const z=Math.max((w+(land?max*.065:0)+24)/im.width,(h+(land?0:max*.065)+24)/im.height);c.drawImage(im,(w-im.width*z)/2-dx*.065,(h-im.height*z)/2-dy*.065,im.width*z,im.height*z);}
 // Mid-distance gas clouds move faster than the distant star field, behind the chapter illustrations.
 c.globalCompositeOperation='screen';
 const nebula=v.images.campaignNebula;
 if(nebula)for(let i=0;i<3;i++){
 const size=Math.min(700,Math.max(w,h)*(.65+i*.09)),extent=size*.72;
 const x=wrap(w*[.22,.82,.48][i]-dx*.23+extent,w+2*extent)-extent;
 const y=wrap(h*[.22,.73,1.18][i]-dy*.23+extent,h+2*extent)-extent;
 c.save();c.translate(x,y);c.rotate(i*2.1+t*[.018,-.012,.009][i]);c.globalAlpha=[.48,.34,.22][i];c.drawImage(nebula,-size/2,-size/2,size,size);c.restore();
 }
 for(let layer=0;layer<2;layer++)for(let i=0;i<45;i++){const seed=i+layer*91,x=wrap(rand(seed)*w-dx*(layer?.13:.035),w),y=wrap(rand(seed+300)*h-dy*(layer?.13:.035),h),r=layer?1.3:.7;c.globalAlpha=(layer?.35:.2)+Math.sin(t*.8+seed)*.08;c.fillStyle=i%9?'#c0deef':'#ead6b2';c.fillRect(x,y,r,r);}
 c.globalAlpha=1;
 // Sparse meteor passes, independent of drag speed. No objects or trails accumulate between frames.
 const cycle=Math.floor(t/7),age=t%7;if(age>.8&&age<1.9){const q=(age-.8)/1.1,sx=w*(.15+rand(cycle+80)*.65)-dx*.1,sy=h*(.12+rand(cycle+180)*.4)-dy*.1,x=sx+q*190,y=sy+q*105,len=65,fade=Math.sin(q*Math.PI),g=c.createLinearGradient(x-len,y-len*.55,x,y);g.addColorStop(0,'#9ac8ed00');g.addColorStop(1,'#d4edff');c.globalAlpha=fade*.7;c.strokeStyle=g;c.lineWidth=1.5;c.beginPath();c.moveTo(x-len,y-len*.55);c.lineTo(x,y);c.stroke();c.fillStyle='#e6f7ff';c.beginPath();c.arc(x,y,1.6,0,Math.PI*2);c.fill();}
 c.restore();
 }
 // A single reusable 160px layer keeps animated light inside the artwork silhouette.
 chapterLayer(){
 if(this.lightLayer!==undefined)return this.lightLayer;
 try{this.lightLayer=typeof wx!=='undefined'&&wx.createOffscreenCanvas?wx.createOffscreenCanvas({type:'2d',width:160,height:160}):typeof document!=='undefined'?document.createElement('canvas'):typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(160,160):null;if(this.lightLayer){this.lightLayer.width=160;this.lightLayer.height=160;}}catch(e){this.lightLayer=null;}
 return this.lightLayer;
 }
 drawChapter(r,active,open){
 const c=this.view.ctx,im=this.view.images.campaignNodes,t=this.animationTime;
 c.save();c.translate(r.cx,r.cy);
 if(active){
 // Soft upper-left key light and a cool rim light, without a selection ring.
 c.save();c.globalCompositeOperation='screen';
 let light=c.createRadialGradient(-19,-27,3,-8,-8,79);light.addColorStop(0,'#d2e6ee42');light.addColorStop(.5,'#80bdce20');light.addColorStop(1,'#84b7d000');c.fillStyle=light;c.fillRect(-90,-90,180,180);
 c.save();c.translate(-27,-41);c.rotate(-.48);c.scale(.48,1);light=c.createRadialGradient(0,0,1,0,0,86);light.addColorStop(0,'#deedff19');light.addColorStop(.5,'#dcecff0d');light.addColorStop(1,'#b3dbed00');c.fillStyle=light;c.fillRect(-86,-86,172,172);c.restore();c.restore();
 }
 c.globalAlpha*=active?1:open?.83:.45;
 if(im)c.drawImage(im,r.art*160,0,160,160,-54,-54,108,108);
 if(active&&im){
 const layer=this.chapterLayer();
 if(layer){const q=layer.getContext('2d');q.clearRect(0,0,160,160);q.globalCompositeOperation='source-over';q.drawImage(im,r.art*160,0,160,160,0,0,160,160);q.globalCompositeOperation='source-atop';
 const key=q.createRadialGradient(49,35,0,59,52,116);key.addColorStop(0,'#eaf4ff55');key.addColorStop(.53,'#c4e6f517');key.addColorStop(1,'#09122528');q.fillStyle=key;q.fillRect(0,0,160,160);
 // The slow narrow reflection sweeps across opaque pixels only.
 const sweep=(t*.12+r.index*.17)%1,x=-65+sweep*290,shine=q.createLinearGradient(x-24,0,x+24,0);shine.addColorStop(0,'#bfeaff00');shine.addColorStop(.5,'#d8f3ff25');shine.addColorStop(1,'#bfeaff00');q.fillStyle=shine;q.fillRect(0,0,160,160);
 if(r.art<3||r.art===6){
 // Small moving highlights follow the organic shell/veins rather than floating particles.
 const veins=r.art===6?[[[82,24],[91,50],[75,92]],[[55,61],[65,90],[52,111]],[[117,64],[129,85],[122,107]]]:r.art===0?[[[74,33],[53,49],[70,78]],[[94,31],[118,47],[109,71]],[[50,101],[78,119],[111,111]]]:r.art===1?[[[54,71],[97,80],[119,111]],[[43,109],[75,133],[109,126]],[[58,94],[87,109],[113,100]]]:[[[63,44],[78,77],[74,100]],[[92,43],[85,72],[99,100]],[[41,114],[78,130],[122,115]]];
 for(let i=0;i<veins.length;i++){const [a,b,d]=veins[i],u=(t*.19+i*.33)%1;q.beginPath();for(let j=0;j<=12;j++){const f=Math.max(0,u-j*.009),v=1-f,px=v*v*a[0]+2*v*f*b[0]+f*f*d[0],py=v*v*a[1]+2*v*f*b[1]+f*f*d[1];j?q.lineTo(px,py):q.moveTo(px,py);}q.lineWidth=2.2;q.strokeStyle=r.art===6?'#ffe69ba0':r.art===0?'#d8b69b77':'#9bdcca77';q.stroke();}
 }
 q.globalCompositeOperation='source-over';c.drawImage(layer,-54,-54,108,108);
 }
 if(r.art>=3&&r.art<6){
 // Engine exhaust is anchored to each illustration; only the selected chapter animates.
 const jets=r.art===3?[[-30,15],[-8,23],[16,17],[36,10]]:r.art===4?[[-29,2],[29,2]]:[[-25,20],[25,20]];
 c.save();c.globalCompositeOperation='screen';for(let i=0;i<jets.length;i++){const [x,y]=jets[i],f=.78+.12*Math.sin(t*9+i*2)+.1*Math.sin(t*17+i),len=(r.art===4?17:10)*f,fire=c.createLinearGradient(x,y,x,y+len);fire.addColorStop(0,'#e7f9ffb0');fire.addColorStop(.28,r.art===3?'#ffd48f85':'#78cfff85');fire.addColorStop(1,'#449eff00');c.fillStyle=fire;c.beginPath();c.moveTo(x-1.6,y);c.quadraticCurveTo(x-3,y+len*.55,x,y+len);c.quadraticCurveTo(x+3,y+len*.55,x+1.6,y);c.fill();}c.restore();
 }
 }
 c.restore();
 }
 drawMapContents(clipArea){const v=this.view,c=v.ctx,g=this.geometry(),p=v.game.progress,nodes=this.layout(),bounds=clipArea||g.area;for(let i=1;i<nodes.length;i++){const a=nodes[i-1],b=nodes[i],on=unlocked(p,i);c.beginPath();c.moveTo(a.cx,a.cy);const mx=(a.cx+b.cx)/2,my=(a.cy+b.cy)/2;if(g.land)c.bezierCurveTo(mx,a.cy,mx,b.cy,b.cx,b.cy);else c.bezierCurveTo(a.cx,my,b.cx,my,b.cx,b.cy);c.strokeStyle=on?'#77cfce':'#415472';c.lineWidth=on?2.5:1;c.setLineDash(on?[]:[4,7]);c.stroke();}c.setLineDash([]);for(const r of nodes){if(r.cy+110<bounds.y||r.cy-110>bounds.y+bounds.h||r.cx+110<bounds.x||r.cx-110>bounds.x+bounds.w)continue;const open=unlocked(p,r.index),done=p.campaignClears?.[r.id],active=this.selected===r.index;c.save();this.drawChapter(r,active,open);v.text(String(r.index+1).padStart(2,'0'),r.cx-50,r.cy-36,12,'#b9d6e3');v.text(r.title,r.cx,r.cy+65,18,active?'#fff0c7':open?'#efe1ba':'#93a2b7','center');if(!open)v.drawSmallLock(r.cx+41,r.cy+34);else v.text(done?'已通关':p.campaignActs?.[r.id]?.act===2?'第二幕':'第一幕',r.cx,r.cy+82,11,done?'#a9e6bb':'#b7d9e5','center');c.restore();}}
 // Test actual alpha compositing, not merely the presence of the offscreen API.
 maskCanvas(){
 if(this.mapLayer!==undefined)return this.mapLayer;
 const makers=[];
 if(typeof wx!=='undefined'){if(wx.createCanvas)makers.push(()=>wx.createCanvas());if(wx.createOffscreenCanvas)makers.push(()=>wx.createOffscreenCanvas({type:'2d',width:4,height:4}));}
 if(typeof document!=='undefined')makers.push(()=>document.createElement('canvas'));
 if(typeof OffscreenCanvas!=='undefined')makers.push(()=>new OffscreenCanvas(4,4));
 for(const make of makers)try{const layer=make();layer.width=4;layer.height=4;const q=layer.getContext('2d');q.fillStyle='#fff';q.fillRect(0,0,4,4);q.globalCompositeOperation='destination-in';q.fillStyle='rgba(255,255,255,0.5)';q.fillRect(0,0,4,4);const alpha=q.getImageData(1,1,1,1).data[3];q.globalCompositeOperation='source-over';if(alpha>115&&alpha<140){this.mapLayer=layer;return layer;}}catch(e){}
 this.mapLayer=null;return null;
 }
 edgeAlpha(distance,span){const inset=Math.min(12,span*.04),fade=Math.min(96,span*.28),t=Math.max(0,Math.min(1,(Math.min(distance,span-distance)-inset)/fade));return t*t*(3-2*t);}
 // Spatial clipping bands preserve the same mask profile even without any secondary canvas.
 // The opaque middle renders once; only the two narrow feathered edges are split.
 drawMapBands(){const c=this.view.ctx,{area:a,land}=this.geometry(),span=land?a.w:a.h,edge=Math.min(12,span*.04)+Math.min(96,span*.28);
 const band=(start,end,alpha)=>{if(alpha<=0||end<=start)return;const r=land?{x:a.x+start,y:a.y,w:end-start,h:a.h}:{x:a.x,y:a.y+start,w:a.w,h:end-start};c.save();c.beginPath();c.rect(r.x,r.y,r.w,r.h);c.clip();c.globalAlpha*=alpha;this.drawMapContents(r);c.restore();};
 band(edge,span-edge,1);for(let start=0;start<edge;start+=3){const end=Math.min(edge,start+3),alpha=this.edgeAlpha((start+end)/2,span);band(start,end,alpha);band(span-end,span-start,alpha);}
 }
 drawMap(){const v=this.view,c=v.ctx,{area:a,land}=this.geometry(),layer=this.maskCanvas();if(!layer){this.drawMapBands();return;}
 const scale=2,width=Math.ceil(a.w*scale),height=Math.ceil(a.h*scale);if(layer.width!==width||layer.height!==height){layer.width=width;layer.height=height;this.mapMaskKey=null;}
 const q=layer.getContext('2d');q.clearRect(0,0,width,height);q.save();q.scale(scale,scale);q.translate(-a.x,-a.y);v.ctx=q;try{this.drawMapContents();}finally{v.ctx=c;q.restore();}
 const span=land?width:height,inset=Math.min(12*scale,span*.04),fade=Math.min(96*scale,span*.28),key=width+','+height+','+land;
 if(this.mapMaskKey!==key){const mask=q.createLinearGradient(0,0,land?width:0,land?0:height);mask.addColorStop(0,'rgba(255,255,255,0)');for(let i=0;i<=16;i++){const t=i/16;mask.addColorStop((inset+t*fade)/span,'rgba(255,255,255,'+(t*t*(3-2*t))+')');}for(let i=16;i>=0;i--){const t=i/16;mask.addColorStop(1-(inset+t*fade)/span,'rgba(255,255,255,'+(t*t*(3-2*t))+')');}mask.addColorStop(1,'rgba(255,255,255,0)');this.mapMask=mask;this.mapMaskKey=key;}
 q.save();q.globalCompositeOperation='destination-in';q.fillStyle=this.mapMask;q.fillRect(0,0,width,height);q.restore();c.drawImage(layer,a.x,a.y,a.w,a.h);
 }
 draw(){const v=this.view,c=v.ctx,w=v.w,h=v.h,g=this.geometry(),p=v.game.progress;this.drawSpace();this.drawMap();const f=this.footer(),m=missions[this.selected],open=unlocked(p,this.selected);c.fillStyle='#08131eef';c.fillRect(0,f.y-5,w,h-f.y+5);c.fillStyle='#6f9da044';c.fillRect(f.x,f.y,f.w,1);v.text(m.title,f.x+4,f.y+29,20,'#f1ddb0');v.text(m.objective,f.x+4,f.y+72,12,'#b1c7d5');const status=m.runtime&&!open?'测试开放 · 正式解锁需通关'+missions[this.selected-1].title:!open?'通关'+missions[this.selected-1].title+'后解锁':m.runtime?'':'关卡内容待接入';v.text(status,f.x+4,f.y+89,11,'#d3b17b');const bw=118,bx=w-bw-22,by=f.y+17;v.gearPanel(bx,by,bw,38,m.runtime?'#375554':'#273240');v.text(m.runtime?(p.campaignActs?.[m.id]?.act===2?'继续第二幕':'进入战役'):open?'查看战役':'未解锁',bx+bw/2,by+25,16,m.runtime?'#ffe2a2':'#96a7b6','center');v.text('扫除虫患  ›',f.x+4,h-30,14,'#abcbd5');if(this.onResume){const r=this.resumeRect();v.gearPanel(r.x,r.y,r.w,r.h,'#375554');v.text('回到正在进行的战役',r.x+r.w/2,r.y+24,Math.min(14,r.w/12),'#ffe2a2','center');}else v.text(build.label,w-22,h-30,11,'#7f99ab','right');}
 down(x,y){this.drag={x,y,scroll:this.scroll,moved:false};return true;}
 move(x,y){if(!this.drag)return;const g=this.geometry(),d=this.drag,delta=g.land?x-d.x:y-d.y;if(Math.abs(delta)>7)d.moved=true;if(d.moved)this.scroll=Math.max(0,Math.min(g.max,d.scroll-delta));}
 up(x,y,cancel=false){const d=this.drag;if(!d)return;this.move(x,y);this.drag=null;if(cancel||d.moved)return;const v=this.view,f=this.footer(),r=this.resumeRect();if(this.onResume&&x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h){this.onResume();return;}if(y>v.h-55&&x<180){this.onSelect('wolf');return;}if(y>=f.y+17&&y<=f.y+55&&x>=v.w-140){const m=missions[this.selected];if(m.runtime)this.onSelect(m.id);return;}const a=this.geometry().area;if(y<a.y||y>a.y+a.h)return;const hit=this.layout().find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);if(hit)this.selected=hit.index;}
 wheel(delta){const g=this.geometry();this.scroll=Math.max(0,Math.min(g.max,this.scroll+delta));}
}
const api={MissionMenu,missions,unlocked,recordClear};if(typeof module!=='undefined')module.exports=api;else globalThis.AlienMissions=api;
})();
