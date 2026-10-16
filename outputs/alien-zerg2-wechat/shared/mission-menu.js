(function(){
const P=typeof module!=='undefined'?require('./progression'):globalThis.ZergProgress;
const build=typeof module!=='undefined'?require('./build-info'):globalThis.AlienBuild;
const {missions}=typeof require==='function'?require('./campaign-order'):globalThis.CampaignOrder;
function unlocked(progress,index){return index===0||progress.campaignClears?.[missions[index].id]===true||!!progress.campaignActs?.[missions[index].id]||progress.campaignClears?.[missions[index-1].id]===true;}
function recordClear(game,id){if(game.challengeLevel||!missions.some(m=>m.id===id)||game.state!=='won')return false;const p=game.progress;p.campaignClears=p.campaignClears||{};if(p.campaignClears[id])return false;p.campaignClears[id]=true;p.campaignActs??={};p.campaignActs[id]={act:3,gold:game.gold||0,convoyLost:game.convoyLost||0};game.progressDirty=true;return true;}
class MissionMenu{
 constructor(view,onSelect,onResume=null){this.view=view;this.onSelect=onSelect;this.onResume=onResume;this.selected=Math.max(0,missions.findIndex((m,i)=>unlocked(view.game.progress,i)&&!view.game.progress.campaignClears?.[m.id]));this.scroll=0;this.animationTime=0;this.lastFrame=0;this.focus();}
 geometry(){const v=this.view,land=v.w>v.h,area={x:12,y:v.top+30,w:v.w-24,h:Math.max(170,v.h-v.top-182)},step=land?166:156;return {land,area,step,max:Math.max(0,missions.length*step+(land?72:138)-(land?area.w:area.h)*.62)};}
 focus(){const g=this.geometry();this.scroll=Math.max(0,Math.min(g.max,this.selected*g.step-(g.land?g.area.w:g.area.h)/2+70));}
 layout(){const {land,area,step}=this.geometry();return missions.map((m,i)=>{const cross=[.3,.7,.35,.7,.3,.7,.35,.7][i%8],cx=land?area.x+72+i*step-this.scroll:area.x+area.w*cross,cy=land?area.y+125:area.y+138+i*step-this.scroll;return {...m,index:i,cx,cy,x:cx-62,y:cy-58,w:124,h:138};});}
 drawStars(count,cx,cy,size=16,slots=count){const v=this.view,c=v.ctx,gap=size+3;for(let i=0;i<slots;i++){const x=cx+(i-(slots-1)/2)*gap;if(i<count)v.sprite('operator-star-native',x,cy,size/26,false,0,c.globalAlpha);else{c.beginPath();for(let j=0;j<10;j++){const angle=-Math.PI/2+j*Math.PI/5,r=size*(j%2?.22:.48),px=x+Math.cos(angle)*r,py=cy+Math.sin(angle)*r;j?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.strokeStyle='#c4b98a';c.lineWidth=1.1;c.stroke();}}}
 drawStarTotal(){const v=this.view,c=v.ctx,x=v.w-108,y=v.top+14;v.sprite('operator-star-native',x+21,y+19,26.4/26);c.save();c.fillStyle='#ffe39a';c.font='700 23px -apple-system, sans-serif';c.textAlign='left';c.textBaseline='alphabetic';c.fillText(String(P.totalCampaignStars(v.game.progress)),x+44,y+27);c.restore();}
 challengeButton(r){const right=r.cx<this.view.w/2;return {x:right?r.cx+55:r.cx-119,y:r.cy-15,w:64,h:32};}
 challengeLayout(){const v=this.view,scale=Math.min(1,(v.w-24)/354,(v.h-v.top-20)/446),w=354*scale,h=446*scale,x=(v.w-w)/2,y=v.top+(v.h-v.top-h)/2,rect=(rx,ry,rw,rh)=>({x:x+rx*scale,y:y+ry*scale,w:rw*scale,h:rh*scale});return {x,y,w,h,scale,rows:[0,1,2,3].map(level=>({...rect(16,58+level*78,322,70),level})),confirm:rect(100,384,154,42),close:rect(310,8,36,36)};}
 drawChallenge(){if(!this.challengeId)return;const v=this.view,c=v.ctx,p=v.game.progress,L=this.challengeLayout(),s=L.scale,m=missions.find(m=>m.id===this.challengeId),level=this.pendingChallengeLevel??P.challengeLevel(p,m.id);c.fillStyle='#020812df';c.fillRect(0,0,v.w,v.h);v.gearPanel(L.x,L.y,L.w,L.h,'#152a36');v.text(m.title+' 难度挑战',L.x+18*s,L.y+33*s,19*s,'#ffe4aa');v.text('×',L.close.x+18*s,L.close.y+26*s,27*s,'#d9e6e8','center');for(const r of L.rows){const mode=P.challengeModes[r.level],done=r.level?p.challengeClears?.[m.id+':'+r.level]:p.campaignClears?.[m.id],selected=level===r.level;v.actionPlate(r.x,r.y,r.w,r.h,selected?'selected':'card');v.text(mode.name,r.x+13*s,r.y+23*s,18*s,'#ffe4aa');v.text('首通奖励'+(done?' · 已领取':''),r.x+r.w-12*s,r.y+22*s,11*s,'#bcd0d9','right');const rewards=r.level===0?[['chips','芯元 ×500'],['chest','物资箱 ×10']]:r.level===1?[['chips','芯元 ×1000'],['chest','物资箱 ×20']]:r.level===2?[['chest','物资箱 ×30'],['fragment','随机碎片 ×50']]:[['gear','随机一件顶级红色装备']];if(mode.stars)this.drawStars(mode.stars,r.x+42*s,r.y+49*s,19.5*s);const start=mode.stars?82:13,cell=(322-start-10)/rewards.length;rewards.forEach(([kind,label],i)=>{const x=r.x+(start+i*cell)*s,y=r.y+49*s,size=24*s;if(kind==='chips')v.hudImage('loot-processing-chip',x,y-size/2,size,size);else if(kind==='chest')v.chestIcon(x+size/2,y,size);else if(kind==='fragment')v.towerSpecGlyph(v.towerSpecKind(12200,0,0),x+size/2,y,size);else{v.hudImage('random-red-equipment',x,y-size/2,size,size);}v.text(label,x+28*s,y+5*s,13*s,'#e3d6bb');});}const r=L.confirm;v.menuActionButton(r,'确认',true,17*s);}
 chooseChallenge(level){const v=this.view;if(P.selectChallenge(v.game.progress,this.challengeId,level)){v.game.progressDirty=true;v.flushSave?.(true);this.challengeId=null;}}
 restartRect(){const {land,area}=this.geometry(),cx=land?area.x+area.w*.62:area.x+area.w/2;return {x:cx-78,y:this.footer().y-93,w:156,h:40};}
 restartVisible(){return !!this.view.onRestartGame&&this.scroll>=this.geometry().max-1;}
 bestiaryRect(){const r=this.restartRect(),g=this.geometry();return {x:g.land?r.x-70:g.area.x+8,y:r.y-8,w:52,h:56};}
 bestiaryVisible(){return this.scroll>=this.geometry().max-1;}
 drawMapBestiary(){if(this.bestiaryVisible())this.view.drawBestiaryEntry(this.bestiaryRect());}
 drawRestart(){if(!this.restartVisible())return;const v=this.view,r=this.restartRect();v.actionPlate(r.x,r.y,r.w,r.h);v.text('一切重新开始',r.x+r.w/2,r.y+26,14,'#b5c3cc','center');}
 resumeRect(){return {x:this.view.w-Math.min(204,this.view.w-162)-18,y:this.view.h-54,w:Math.min(204,this.view.w-162),h:36};}
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
 const c=this.view.ctx,im=r.id==='iron-alien'?this.view.images.ironAlienIcon:this.view.images.campaignNodes,t=this.animationTime;
 c.save();c.translate(r.cx,r.cy);
 if(active){
 // Soft upper-left key light and a cool rim light, without a selection ring.
 c.save();c.globalCompositeOperation='screen';
 let light=c.createRadialGradient(-19,-27,3,-8,-8,79);light.addColorStop(0,'#d2e6ee42');light.addColorStop(.5,'#80bdce20');light.addColorStop(1,'#84b7d000');c.fillStyle=light;c.fillRect(-90,-90,180,180);
 c.save();c.translate(-27,-41);c.rotate(-.48);c.scale(.48,1);light=c.createRadialGradient(0,0,1,0,0,86);light.addColorStop(0,'#deedff19');light.addColorStop(.5,'#dcecff0d');light.addColorStop(1,'#b3dbed00');c.fillStyle=light;c.fillRect(-86,-86,172,172);c.restore();c.restore();
 }
 c.globalAlpha*=active?1:open?.83:.45;
 if(im)c.drawImage(im,(r.id==='iron-alien'?0:r.art)*160,0,160,160,-54,-54,108,108);
 if(active&&im){
 const layer=this.chapterLayer();
 if(layer){const q=layer.getContext('2d');q.clearRect(0,0,160,160);q.globalCompositeOperation='source-over';q.drawImage(im,(r.id==='iron-alien'?0:r.art)*160,0,160,160,0,0,160,160);q.globalCompositeOperation='source-atop';
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
 drawMapContents(clipArea){const v=this.view,c=v.ctx,g=this.geometry(),p=v.game.progress,nodes=this.layout(),bounds=clipArea||g.area;for(let i=1;i<nodes.length;i++){const a=nodes[i-1],b=nodes[i],on=unlocked(p,i);c.beginPath();c.moveTo(a.cx,a.cy);const mx=(a.cx+b.cx)/2,my=(a.cy+b.cy)/2;if(g.land)c.bezierCurveTo(mx,a.cy,mx,b.cy,b.cx,b.cy);else c.bezierCurveTo(a.cx,my,b.cx,my,b.cx,b.cy);c.strokeStyle=on?'#77cfce':'#415472';c.lineWidth=on?2.5:1;c.setLineDash(on?[]:[4,7]);c.stroke();}c.setLineDash([]);for(const r of nodes){if(r.cy+110<bounds.y||r.cy-110>bounds.y+bounds.h||r.cx+110<bounds.x||r.cx-110>bounds.x+bounds.w)continue;const open=unlocked(p,r.index),done=p.campaignClears?.[r.id],active=this.selected===r.index;c.save();this.drawChapter(r,active,open);if(done){const sx=Math.max(52,Math.min(v.w-52,r.cx+(r.cx<v.w/2?88:-88)));this.drawStars(P.campaignStars(p,r.id),sx,r.cy-50,13,6);}v.text(r.title,r.cx,r.cy+65,18,active?'#fff0c7':open?'#efe1ba':'#93a2b7','center');if(!open)v.drawSmallLock(r.cx+41,r.cy+34);else{const level=P.challengeLevel(p,r.id),mode=P.challengeModes[level],checkpoint=P.campaignCheckpoint(p,r.id),status=level?(p.challengeClears?.[r.id+':'+level]?'已通关':checkpoint?.act===2?'第二幕':'第一幕'):done?'已通关':checkpoint?.act===2?'第二幕':'第一幕';v.text((level?mode.name+' · ':'')+status,r.cx,r.cy+82,11,level?'#f2c17e':done?'#a9e6bb':'#b7d9e5','center');if(done&&active){const b=this.challengeButton(r);v.actionPlate(b.x,b.y,b.w,b.h,'active');v.text('挑战 ›',b.x+b.w/2,b.y+21,14,'#ffe1a2','center');}}c.restore();}}
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
 draw(){const v=this.view;if(v.bestiaryOpen){const now=Date.now();v.bestiaryClock=(v.bestiaryClock||0)+(this.lastFrame?Math.max(0,Math.min(.1,(now-this.lastFrame)/1000)):0);this.lastFrame=now;v.drawBestiary();return;}const c=v.ctx,w=v.w,h=v.h,g=this.geometry(),p=v.game.progress;this.drawSpace();this.drawMap();this.drawRestart();this.drawMapBestiary();this.drawStarTotal();const f=this.footer(),m=missions[this.selected],open=unlocked(p,this.selected);c.fillStyle='#08131eef';c.fillRect(0,f.y-5,w,h-f.y+5);c.fillStyle='#6f9da044';c.fillRect(f.x,f.y,f.w,1);const level=P.challengeLevel(p,m.id),difficulty=level?P.challengeModes[level].name:'',left=f.x+4,available=w-150-left,size=Math.min(20,available/(m.title.length+(level?difficulty.length+1.4:0))),baseline=f.y+42;v.text(m.title,left,baseline,size,'#f1ddb0');if(level){const titleWidth=c.measureText(m.title).width,dotX=left+titleWidth+size*.7;v.text('·',dotX,baseline+size*.08,size*1.5,'#e3c68d','center');v.text(difficulty,dotX+size*.7,baseline,size,'#e3c68d');}const bw=118,bx=w-bw-22,by=f.y+17;v.actionPlate(bx,by,bw,38,m.runtime?'active':'idle');v.text(m.runtime?(P.campaignCheckpoint(p,m.id)?.act===2?'继续第二幕':'进入战役'):open?'查看战役':'未解锁',bx+bw/2,by+25,16,m.runtime?'#ffe2a2':'#96a7b6','center');if(this.onResume){const r=this.resumeRect();v.actionPlate(r.x,r.y,r.w,r.h,'active');v.text('回到正在进行的战役',r.x+r.w/2,r.y+24,Math.min(14,r.w/12),'#ffe2a2','center');}else v.text(build.label,w-22,h-30,11,'#7f99ab','right');this.drawChallenge();}
 down(x,y){if(this.challengeId){this.drag={x,y,moved:false,modal:true};return true;}this.archiveGesture=!!this.view.bestiaryOpen;if(this.archiveGesture){this.drag=null;this.view.down('mission-bestiary',x,y);return true;}this.drag={x,y,scroll:this.scroll,moved:false};return true;}
 move(x,y){if(this.archiveGesture){if(this.view.bestiaryOpen)this.view.motion('mission-bestiary',x,y);return;}if(!this.drag)return;if(this.drag.modal){if(Math.hypot(x-this.drag.x,y-this.drag.y)>7)this.drag.moved=true;return;}const g=this.geometry(),d=this.drag,delta=g.land?x-d.x:y-d.y;if(Math.abs(delta)>7)d.moved=true;if(d.moved)this.scroll=Math.max(0,Math.min(g.max,d.scroll-delta));}
 up(x,y,cancel=false){if(this.archiveGesture){this.archiveGesture=false;if(this.view.bestiaryOpen)this.view.up('mission-bestiary',x,y,cancel);return;}const d=this.drag;if(!d)return;this.move(x,y);this.drag=null;if(cancel||d.moved)return;if(d.modal){const L=this.challengeLayout(),hit=r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h,row=L.rows.find(hit);if(row)this.pendingChallengeLevel=row.level;else if(hit(L.confirm))this.chooseChallenge(this.pendingChallengeLevel??P.challengeLevel(this.view.game.progress,this.challengeId));else if(hit(L.close)){this.challengeId=null;this.pendingChallengeLevel=null;}return;}const v=this.view,book=this.bestiaryVisible()?this.bestiaryRect():null;if(book&&x>=book.x&&x<=book.x+book.w&&y>=book.y&&y<=book.y+book.h){v.bestiaryOpen=true;v.bestiaryEntry=null;v.bestiaryClock=0;v.bestiaryDrag=null;return;}const reset=this.restartRect();if(this.restartVisible()&&x>=reset.x&&x<=reset.x+reset.w&&y>=reset.y&&y<=reset.y+reset.h){v.onRestartGame();return;}const f=this.footer(),r=this.resumeRect();if(this.onResume&&x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h){this.onResume();return;}if(y>=f.y+17&&y<=f.y+55&&x>=v.w-140){const m=missions[this.selected];if(m.runtime)this.onSelect(m.id);return;}const a=this.geometry().area;if(y<a.y||y>a.y+a.h)return;const challenge=this.layout().find(r=>{const b=this.challengeButton(r);return r.index===this.selected&&v.game.progress.campaignClears?.[r.id]&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h;});if(challenge){this.selected=challenge.index;this.challengeId=challenge.id;this.pendingChallengeLevel=P.challengeLevel(v.game.progress,challenge.id);return;}const hit=this.layout().find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);if(hit)this.selected=hit.index;}
 wheel(delta){if(this.challengeId)return;const v=this.view;if(v.bestiaryOpen){if(v.bestiaryEntry)v.bestiaryScroll=Math.max(0,Math.min(v.bestiaryScrollMax||0,(v.bestiaryScroll||0)+delta));else v.bestiaryListScroll=Math.max(0,Math.min(v.bestiaryLayout().scrollMax,(v.bestiaryListScroll||0)+delta));return;}const g=this.geometry();this.scroll=Math.max(0,Math.min(g.max,this.scroll+delta));}
}
const api={MissionMenu,missions,unlocked,recordClear};if(typeof module!=='undefined')module.exports=api;else globalThis.AlienMissions=api;
})();
