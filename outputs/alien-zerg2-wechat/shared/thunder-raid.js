(function(){
const node=typeof require==='function',L=node?require('./thunder-raid-layout'):globalThis.ThunderRaidLayout,baseD=node?require('./level-data'):globalThis.ZergLevel,baseA=node?require('./art-data'):globalThis.ZergArt,core=node?require('./core'):globalThis.ZergCore,view=node?require('./view'):globalThis.ZergView;
const waveCount=8,units=Array.from({length:5},(_,i)=>[11,69998,0,L.routes[0][0].x,L.routes[0][0].y,0,i+1]),pathList=L.routes.map((r,lane)=>r.slice(1).map((p,i)=>{const id=100+lane*200+i;units.push([11,69998,0,p.x,p.y,0,id]);return id;}));
const waves=Array.from({length:waveCount},(_,i)=>{
 const commands=[];
 for(let path=1;path<=2;path++){
  commands.push({raidWave:true,spawn:path,path,formation:1,beginWaveDelay:path===1?1500:6000,nextDelay:0,perUnitDelay:1400,hpScale:5+i*.5,attackScale:2,unit:i%3===2?12503:12500,count:14+i*2});
  if(i>0)commands.push({raidWave:true,spawn:path,path,formation:1,beginWaveDelay:9000,nextDelay:0,perUnitDelay:2600,hpScale:3.5+i*.2,attackScale:2,unit:12502,count:3+i});
  if([1,3,4,6,7].includes(i))commands.push({raidWave:true,spawn:path+3,path,formation:1,beginWaveDelay:12000+(path-1)*5000,nextDelay:0,perUnitDelay:2400,hpScale:.9+i*.1,attackScale:2,unit:12509,count:3+Math.floor(i/2)});
 }
 // Act one has single thunder encounters; act two upgrades each to a staggered pair.
 if([2,5,7].includes(i))commands.push({raidWave:true,spawn:3,path:i===5?2:1,formation:1,beginWaveDelay:15000,nextDelay:0,perUnitDelay:3000,hpScale:1.2+i*.08,attackScale:1.8,unit:915001,count:1,mailEncounter:true,campaignFinalBoss:true,raidThunder:true});
 return commands;
});
const D={...baseD,map:'world/thunder-raid',title:'雷兽突袭',size:L.size,ambush:null,strategicRoads:null,terrainGrid:{roadsBaked:true},navigationBounds:{left:24,top:24,right:L.size[0]-24,bottom:L.size[1]-24},buildTerrain:L.buildTerrain,units,settings:{...baseD.settings,gold:5000,pathList,totalWave:waveCount,beginTimeDelayPerWave:Array(waveCount).fill(115000)},waves,secondActWaves:waves.map(w=>w.map(c=>({...c,hpScale:c.hpScale*1.4,attackScale:c.attackScale*1.25,count:c.raidThunder?2:c.count+3}))),unitTypes:{...baseD.unitTypes},campaignConfig:{id:'thunderraid',playerStart:L.playerStart,objective:L.objectives[0],objectives:L.objectives,caves:true,spawnIds:[1],bossIds:[915001],chests:[],clearWaveDelay:6}};
const A={...baseA,pages:[...baseA.pages],frames:{...baseA.frames},groups:{...baseA.groups},props:[],blocks:[]};const maskPage=A.pages.push('thunderraid-mask.png')-1,buildAreaPage=A.pages.push('thunderraid-build-area.png')-1;const C=core.create(D,A),api=view.create(D,A,C),p=C.Game.prototype;
const begin=p.beginWave;
p.beginWave=function(...args){
 const before=this.wave;this.largeEncounter={id:915001,wave:this.wave+1};const result=begin.apply(this,args);if(before===this.wave||this.cleanup)return result;
 if(this.wave%2===0)this.spawnEggCluster();
 const round=(this.wave-1)%8+1;
 if([4,7].includes(round)&&!this.enemies.some(e=>e.hp>0&&e.raidHarasser)){
  const choice=Math.min(2,Math.floor(this.random()*3)),e=choice===0?this.spawnMantisEncounter():choice===1?this.spawnBrainEncounter():this.spawnMailMonster(915000);
  if(e){e.largeEncounter=true;e.raidHarasser=true;this.lootNotice='大型虫族接近 · 注意矿区骚扰';this.lootNoticeUntil=this.time+4;}
 }
 return result;
};
p.spawnInsectBase=function(){return null;};
// Apply this chapter's 15% reduction once after all species-specific initialization.
const spawn=p.spawn;p.spawn=function(command){const e=spawn.call(this,command);if(e){e.hp*=.85;e.maxHp*=.85;e.damage*=.85;if(e.giantAttackScale)e.giantAttackScale*=.85;if(e.skillDamageScale)e.skillDamageScale*=.85;}if(!e)return e;if(command.raidWave){e.raidLane=command.raidThunder?(command.path-1+(command.ordinal||0))%2:command.path-1;e.waypoints=L.routes[e.raidLane].slice(1);e.wp=0;e.x=L.routes[e.raidLane][0].x;e.y=L.routes[e.raidLane][0].y;e.emergeFrom=null;e.burrowCooldown=Infinity;}return e;};
p.defenseTarget=function(e){return this.refineries[e.raidLane??0]||this.refinery;};
const original=p.updateCampaignEnemy;
p.updateCampaignEnemy=function(e,target,dt){if(e.raidLane==null)return original.call(this,e,target,dt);const refinery=this.defenseTarget(e);if(e.wp<e.waypoints.length){const boost=e.id===915001?this.thunderAdvanceMultiplier(e):1;let budget=e.speed*(e.slowUntil>this.time?1-e.slow:1)*dt*boost;this.pose(e,'walk');e.attacking=false;e.animAge+=dt*(boost-1);while(budget>0&&e.wp<e.waypoints.length){const q=e.waypoints[e.wp],d=Math.hypot(q.x-e.x,q.y-e.y);if(d<.001){e.wp++;continue;}const step=Math.min(d,budget);e.angle=Math.atan2(q.y-e.y,q.x-e.x);e.x+=(q.x-e.x)*step/d;e.y+=(q.y-e.y)*step/d;budget-=step;if(step===d)e.wp++;}return true;}
// Keep the scripted target after reaching an exit; thunder skills may also threaten the nearby vehicle.
if(e.id===915001){const targets=this.mailTargets;this.mailTargets=()=>[refinery,...(this.player.hp>0&&Math.hypot(this.player.x-refinery.x,this.player.y-refinery.y)<250?[this.player]:[])];try{return original.call(this,e,refinery,dt);}finally{this.mailTargets=targets;}}
e.attacking=true;e.angle=Math.atan2(refinery.y-e.y,refinery.x-e.x);if(e.cd<=0){this.pose(e,'attack');e.animAge=0;e.cd=D.unitTypes[e.id].attr.atk_interval/1000;this.enemyMeleeImpact(e,refinery);this.hurt(refinery,e.damage);}return true;};
p.hasGround=function(x,y){return groundShape.contains(x,y)&&!rimShapes.some(shape=>shape.contains(x,y));};
// Use the existing hive cave, including its foreground lip over emerging enemies.
const drawCave=api.View.prototype.drawSpawnCave;
api.View.prototype.drawSpawnCave=function(point,front=false){if(!point)return;const c=this.ctx;c.save();try{c.translate(point.x,point.y);c.scale(1.3,1.3);c.translate(-point.x,-point.y);drawCave.call(this,point,front);}finally{c.restore();}};
// The detailed cliff is baked underneath the ground and shares the true alpha mask.
api.View.prototype.drawWorldBackdrop=function(){};
// Match the visible road edge and crater rim without whole-cell expansion of the tower base.
function segmentHitsBox(a,b,box){let lo=0,hi=1;for(const axis of ['x','y']){const d=b[axis]-a[axis],min=box[axis+'0'],max=box[axis+'1'];if(Math.abs(d)<1e-9){if(a[axis]<min||a[axis]>max)return false;continue;}let t0=(min-a[axis])/d,t1=(max-a[axis])/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;}return true;}
// Row-index polygon edges: exact point/rim queries only visit edges crossing nearby rows.
function polygonIndex(points){
 const rows=new Map(),edges=[];let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];x0=Math.min(x0,a.x);x1=Math.max(x1,a.x);y0=Math.min(y0,a.y);y1=Math.max(y1,a.y);const edge={a,b};edges.push(edge);for(let row=Math.floor(Math.min(a.y,b.y)/32);row<=Math.floor(Math.max(a.y,b.y)/32);row++){if(!rows.has(row))rows.set(row,[]);rows.get(row).push(edge);}}
 return {x0,y0,x1,y1,contains(x,y){if(x<x0||x>x1||y<y0||y>y1)return false;let inside=false;for(const {a,b}of rows.get(Math.floor(y/32))||[])if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;return inside;},hits(box){if(box.x1<x0||box.x0>x1||box.y1<y0||box.y0>y1)return false;if(this.contains(box.x0,box.y0)||this.contains(box.x1,box.y0)||this.contains(box.x1,box.y1)||this.contains(box.x0,box.y1))return true;for(let row=Math.floor(box.y0/32);row<=Math.floor(box.y1/32);row++)for(const {a,b}of rows.get(row)||[])if(segmentHitsBox(a,b,box))return true;return false;}};
}
const groundShape=polygonIndex(L.perimeter),buildShape=polygonIndex(L.source.groundPerimeter.map(q=>({x:q.x*L.worldScale,y:q.y*L.worldScale}))),rimShapes=L.craters.map(h=>polygonIndex(L.craterRim(h))),roadRadius=L.roadWidth/2+3*L.worldScale,roadRadius2=roadRadius*roadRadius,roadBins=new Map();
// Expand segment bins by the road radius and the full tower footprint. Query by tower center.
for(const route of L.routes)for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],segment={a,b,dx:b.x-a.x,dy:b.y-a.y};segment.length2=segment.dx*segment.dx+segment.dy*segment.dy;for(let y=Math.floor((Math.min(a.y,b.y)-roadRadius-40)/128);y<=Math.floor((Math.max(a.y,b.y)+roadRadius+40)/128);y++)for(let x=Math.floor((Math.min(a.x,b.x)-roadRadius-25)/128);x<=Math.floor((Math.max(a.x,b.x)+roadRadius+25)/128);x++){const key=y*64+x;if(!roadBins.has(key))roadBins.set(key,[]);roadBins.get(key).push(segment);}}
function roadHits(segment,box){const {a,b,dx,dy,length2}=segment;if(segmentHitsBox(a,b,box))return true;for(const q of [a,b]){const x=Math.max(box.x0-q.x,0,q.x-box.x1),y=Math.max(box.y0-q.y,0,q.y-box.y1);if(x*x+y*y<roadRadius2)return true;}for(let i=0;i<4;i++){const x=i&1?box.x1:box.x0,y=i&2?box.y1:box.y0,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(length2||1))),xx=x-a.x-dx*t,yy=y-a.y-dy*t;if(xx*xx+yy*yy<roadRadius2)return true;}return false;}
p.geometryBuildSiteError=function(x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y))return '此处地形不能建造';
 const box={x0:x-25,x1:x+25,y0:y-40,y1:y+40};
 if(box.x0<168*L.worldScale||box.x1>L.size[0]-168*L.worldScale||box.y0<110*L.worldScale||!buildShape.contains(box.x0,box.y0)||!buildShape.contains(box.x1,box.y0)||!buildShape.contains(box.x1,box.y1)||!buildShape.contains(box.x0,box.y1))return '此处地形不能建造';
 for(const shape of rimShapes)if(shape.hits(box))return '陨石坑崖壁不能建造';
 for(const segment of roadBins.get(Math.floor(y/128)*64+Math.floor(x/128))||[])if(roadHits(segment,box))return '怪物进攻道路不能建造';
 return '';
};
// Immutable map decisions are baked once during build; towers/buildings stay dynamic.
const baked=node?require('./thunder-raid-build-data'):globalThis.ThunderRaidBuildData,siteErrors=['','此处地形不能建造','陨石坑崖壁不能建造','怪物进攻道路不能建造'];
let siteRuns=null;
// Mini-game runtimes need not expose Buffer, atob or wx.base64ToArrayBuffer.
// Decode the baked bytes directly, once, using only standard JavaScript.
if(baked?.runs){
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',encoded=baked.runs;
 const padding=encoded.endsWith('==')?2:encoded.endsWith('=')?1:0,bytes=new Uint8Array(encoded.length/4*3-padding);
 let bits=0,value=0,offset=0;
 for(let i=0;i<encoded.length-padding;i++){
  value=(value<<6)|alphabet.indexOf(encoded[i]);bits+=6;
  if(bits>=8){bits-=8;bytes[offset++]=(value>>bits)&255;value&=(1<<bits)-1;}
 }
 siteRuns=new Uint16Array(bytes.length/2);
 for(let i=0;i<siteRuns.length;i++)siteRuns[i]=bytes[i*2]|bytes[i*2+1]<<8;
}
p.staticBuildSiteError=function(x,y){
 if(siteRuns&&Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<baked.width&&y>=0&&y<baked.height){let lo=baked.rows[y],hi=baked.rows[y+1]-1;while(lo<hi){const mid=(lo+hi)>>1;if(x>=(siteRuns[mid]>>2))lo=mid+1;else hi=mid;}return siteErrors[siteRuns[lo]&3];}
 return this.geometryBuildSiteError(x,y);
};
p.buildSiteError=function(x,y){const error=this.staticBuildSiteError(x,y);if(error)return error;
 if(this.refineries.some(t=>Math.abs(t.x-x)<110&&Math.abs(t.y-y)<140)||this.towers.some(t=>Math.abs(t.x-x)<50&&Math.abs(t.y-y)<80))return '此处与建筑重叠';
 for(let cy=Math.floor((y-40)/24);cy<=Math.floor((y+40)/24);cy++)for(let cx=Math.floor((x-25)/24);cx<=Math.floor((x+25)/24);cx++)if(this.nav.cells.has(cx+','+cy))return '固定山石不能建造';
 return '';
};
// Load one complete fixed range map during stage loading. Prepare dynamic cutouts on startup,
// then reuse it until a tower/refinery/block changes; never reveal scanning tiles on selection.
api.View.prototype.prepareRaidBuildArea=function(){
 const g=this.game,source=this.images.pages?.[buildAreaPage];if(!source)return null;
 const key=[g.nav.cells.size,...g.refineries.map(r=>r.x+','+r.y),...g.towers.map(t=>t.x+','+t.y)].join('|');
 if(this.raidBuildAreaSource===source&&this.raidBuildAreaKey===key&&this.raidBuildAreaCanvas)return this.raidBuildAreaCanvas;
 let canvas=this.raidBuildAreaCanvas;if(!canvas){try{canvas=typeof wx!=='undefined'?(wx.createOffscreenCanvas?wx.createOffscreenCanvas({type:'2d',width:source.width,height:source.height}):wx.createCanvas()):typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(source.width,source.height):typeof document!=='undefined'?document.createElement('canvas'):null;}catch(e){return null;}if(!canvas)return null;canvas.width=source.width;canvas.height=source.height;}
 const c=canvas.getContext('2d');c.globalCompositeOperation='source-over';c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(source,0,0);c.globalCompositeOperation='destination-out';c.fillStyle='#000';
 for(const r of g.refineries)c.fillRect(r.x-110,r.y-140,220,280);
 for(const t of g.towers)c.fillRect(t.x-50,t.y-80,100,160);
 for(const key of g.nav.cells){const [x,y]=key.split(',').map(Number);c.fillRect(x*24-25,y*24-40,74,104);}
 c.globalCompositeOperation='source-over';this.raidBuildAreaSource=source;this.raidBuildAreaKey=key;return this.raidBuildAreaCanvas=canvas;
};
api.View.prototype.drawBuildArea=function(){if(this.game.state!=='playing')return;const image=this.prepareRaidBuildArea();if(this.game.buildSelected&&image)this.ctx.drawImage(image,0,0);};
api.View.prototype.drawTerrain=function(){const b=L.terrainBounds;this.ctx.drawImage(this.terrainImage(),b.x,b.y,b.w,b.h);};
// Punch the authored crater openings out of the cached terrain; space is drawn underneath.
api.View.prototype.terrainImage=function(){
 const source=this.images.terrain;if(this.raidTerrainSource===source&&this.raidTerrain)return this.raidTerrain;
 let canvas;try{canvas=typeof wx!=='undefined'?(wx.createOffscreenCanvas?wx.createOffscreenCanvas({type:'2d',width:source.width,height:source.height}):wx.createCanvas()):typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(source.width,source.height):typeof document!=='undefined'?document.createElement('canvas'):null;}catch(e){return source;}if(!canvas)return source;
 canvas.width=source.width;canvas.height=source.height;const c=canvas.getContext('2d');c.drawImage(source,0,0);const mask=this.images.pages?.[maskPage];if(mask){c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0,canvas.width,canvas.height);}c.scale(canvas.width/L.terrainBounds.w,canvas.height/L.terrainBounds.h);c.translate(-L.terrainBounds.x,-L.terrainBounds.y);if(!mask){c.globalCompositeOperation='destination-in';c.beginPath();L.perimeter.forEach((p,i)=>c[i?'lineTo':'moveTo'](p.x,p.y));c.closePath();c.fill();}c.globalCompositeOperation='destination-out';c.fillStyle='#000';for(const hole of L.craters){c.beginPath();L.craterOutline.forEach(([x,y],i)=>c[i?'lineTo':'moveTo'](hole.x+x*hole.width,hole.y+y*hole.width));c.closePath();c.fill();}this.raidTerrainSource=source;return this.raidTerrain=canvas;
};
const stage={api,core:C,art:A,data:D,layout:L};if(node)module.exports=stage;else globalThis.ThunderRaid=stage;
})();
