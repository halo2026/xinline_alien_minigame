(function(){
const spikeArt={"spikes":[[0,0,70,60,-35,-30.0],[70,0,70,60,-35,-30.0],[140,0,70,60,-35,-30.0],[210,0,70,60,-35,-30.0],[280,0,70,60,-35,-30.0],[350,0,70,60,-35,-30.0],[0,60,70,70,-35,-35.0],[70,60,70,70,-35,-35.0],[140,60,70,70,-35,-35.0],[210,60,70,70,-35,-35.0],[280,60,70,70,-35,-35.0],[350,60,70,70,-35,-35.0]],"dust":[[0,0,51,37,-25.5,-18.5],[53,0,98,58,-49.0,-29.0],[153,0,98,58,-49.0,-29.0],[253,0,83,48,-42.0,-24.0],[338,0,93,53,-46.5,-26.5],[0,60,94,54,-47.0,-27.0],[96,60,95,54,-47.5,-27.0],[193,60,95,54,-47.5,-27.0],[290,60,96,55,-48.0,-27.5],[388,60,97,56,-48.5,-28.0],[0,118,98,58,-49.0,-29.0]]}; // native-spike-art
// Clear authored props by their actual visible bounds, not just their anchor.
function prepare(D,A){
 D.campaignConfig={...D.campaignConfig,bossIds:[...D.campaignConfig.bossIds,915001]};
 D.secondActWaves=D.waves.map((wave,i)=>wave.map(cmd=>i===D.waves.length-1&&cmd.unit===12517?{...cmd,unit:915001,escortBoss:true,campaignFinalBoss:true}: {...cmd}));
 const removed=[];A.props=A.props.filter(p=>{const f=A.frames[p.frame],x=p.x+(p.flip?-f.ox-(f.ow||f.w):f.ox),y=p.y+f.oy,hit=x<2300&&x+(f.ow||f.w)>1510&&y<2400&&y+(f.oh||f.h)>2070;if(hit)removed.push(p);return !hit;});
 const gone=new Set(removed.flatMap(p=>(p.blocks||[]).map(b=>b.join(',')))),kept=new Set(A.props.flatMap(p=>(p.blocks||[]).map(b=>b.join(','))));A.blocks=A.blocks.filter(b=>!gone.has(b.join(','))||kept.has(b.join(',')));
 const m=D.buildTerrain;D.buildTerrain={...m,cells:m.cells.slice()};for(let cy=0;cy<m.rows;cy++)for(let cx=0;cx<m.cols;cx++){const x=(cx+.5)*m.cellSize-1630,y=(cy+.5)*m.cellSize-2160,u=x*.838+y*.545,v=-x*.545+y*.838;if(u>-135&&u<160&&Math.abs(v)<85)D.buildTerrain.cells[cy*m.cols+cx]=2;}
}
function install(C,api,D,A){
const spikePages={spikes:A.pages.push('escort-spikes.png')-1,dust:A.pages.push('escort-spike-dust.png')-1};
for(const kind of ['spikes','dust'])for(const [i,f]of spikeArt[kind].entries())A.frames['escort-'+kind+'/'+i]={page:spikePages[kind],x:f[0],y:f[1],w:f[2],h:f[3],ox:f[4],oy:f[5]};
const page=A.pages.push('escort-starship.png')-1;
A.frames['escort-starship']={page,x:0,y:0,w:536,h:278,ox:-400.66,oy:-207.805,ow:801.32,oh:415.61};
A.props.push({frame:'escort-starship',x:1900,y:2250,zOrder:-300});
const p=C.Game.prototype,update=p.updateConvoys;
p.convoyLowHealthAlert=function(t){return t.hp>0&&!t.delivered&&t.hp<t.maxHp/3?.18+.72*(.5+.5*Math.cos(this.time*Math.PI*2/1.2)):0;};

// The finale follows the same authored road and boss AI as the first-act leader.
const leader=D.unitTypes[12517].attr,thunder=D.unitTypes[915001];
D.unitTypes[915001]={...thunder,attr:{...thunder.attr,move_speed:leader.move_speed,atk_radius:leader.atk_radius,atk_defend_radius:leader.atk_defend_radius,atk_interval:leader.atk_interval}};
const spawn=p.spawn,pool=p.campaignBossPool;
p.spawn=function(cmd){const e=spawn.call(this,cmd);if(e&&cmd.escortBoss){e.escortBoss=true;e.campaignFinalBoss=true;e.speed=leader.move_speed*.9*((D.unitTypes[12517].scale||1)>=1.2?1.2*1.2:1);}return e;};
p.campaignBossPool=function(e){return pool.call(this,e.escortBoss?{...e,id:12517}:e);};

// The escort has no visible refinery target. Brain ambushes stay east of its truck road.
p.brainEncounterPoint=function(previous){
 const route=D.campaignConfig.convoyRoute.map(id=>C.points[id]),live=this.convoys.filter(c=>c.hp>0&&!c.delivered),focus=live[0]||this.player;
 const candidates=[];for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i];for(let t=0;t<=1;t+=.125)for(const offset of [200,250,300]){const q={x:a.x+(b.x-a.x)*t+offset,y:a.y+(b.y-a.y)*t};if(q.y>2000||this.towers.some(tower=>tower.life>0&&Math.hypot(q.x-tower.x,q.y-tower.y)<140))continue;if([[0,0],[-90,0],[90,0],[0,-55],[0,55]].every(([x,y])=>this.hasGround(q.x+x,q.y+y)&&!this.nav.blocked(q.x+x,q.y+y)))candidates.push(q);}}
 candidates.sort((a,b)=>Math.hypot(a.x-focus.x,a.y-focus.y)-Math.hypot(b.x-focus.x,b.y-focus.y));return candidates.length?candidates[Math.floor(this.random()*Math.min(8,candidates.length))]:previous?{x:previous.x,y:previous.y}:{x:1540,y:1280};
};
const boss=p.updateCampaignBoss;p.updateCampaignBoss=function(e,target){const start=this.fx.length,result=boss.call(this,e,target),line=this.fx.slice(start).filter(f=>f.skill==='spikes');if((e.id!==12517&&!e.escortBoss)||!line.length)return result;
 this.fx.splice(start,this.fx.length-start);const a=Math.atan2(target.y-e.y,target.x-e.x),template=line[0];e.zergSkillName='地刺突击';
 // Skill 14036: twelve eruptions, 40 world units apart, every 80 ms.
 for(let i=0;i<12;i++){const delay=1.25+i*.08;this.fx.push({...template,x:e.x+Math.cos(a)*40*(i+1),y:e.y+Math.sin(a)*40*(i+1),radius:50,age:-delay,warning:delay,life:2.2,nativeSpikes:true,spikeIndex:i});}return result;};
const hazard=p.updateZergBossHazard;p.updateZergBossHazard=function(f){if(!f.nativeSpikes)return hazard.call(this,f);if(f.owner.hp>0&&!this.cleanup&&this.state==='playing'&&f.age>=0&&f.age<.1)return;const hit=f.hit,start=this.events.length;hazard.call(this,f);if(!hit&&f.hit){this.events.splice(start);if(f.spikeIndex===0)this.events.push('impale');}};
p.updateConvoys=function(dt){
 this.boardingConvoys=(this.boardingConvoys||[]).filter(c=>(c.boardAge+=dt)<2.6);
 const before=this.convoys.slice();update.call(this,dt);
 for(const c of before)if(c.delivered&&!c.boarded){c.boarded=true;this.boardingConvoys.push({...c,boardAge:0,sx:c.x,sy:c.y});}
};
const v=api.View.prototype,sprite=v.sprite;
const drawConvoy=v.drawConvoy;v.drawConvoy=function(t){this.convoyBodyAlert=this.game.convoyLowHealthAlert(t);try{return drawConvoy.call(this,t);}finally{this.convoyBodyAlert=0;}};
// One small reusable alpha-masked buffer, never an atlas-sized tinted copy.
v.drawConvoyRedBody=function(name,x,y,scale,flip,angle){const f=A.frames[name];if(!f)return;let canvas=this.convoyTintCanvas;if(!canvas){try{canvas=typeof wx!=='undefined'?(wx.createOffscreenCanvas?wx.createOffscreenCanvas({type:'2d',width:f.w,height:f.h}):wx.createCanvas()):typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(f.w,f.h):typeof document!=='undefined'?document.createElement('canvas'):null;}catch(e){return;}if(!canvas)return;this.convoyTintCanvas=canvas;}
 if(this.convoyTintFrame!==name){canvas.width=f.w;canvas.height=f.h;const q=canvas.getContext('2d');q.clearRect(0,0,f.w,f.h);q.drawImage(this.images.pages[f.page],f.x,f.y,f.w,f.h,0,0,f.w,f.h);q.globalCompositeOperation='source-in';q.fillStyle='#ff251b';q.fillRect(0,0,f.w,f.h);q.globalCompositeOperation='source-over';this.convoyTintFrame=name;}
 const c=this.ctx;c.save();c.translate(x,y);c.rotate(angle||0);c.scale(flip?-scale:scale,scale);c.globalAlpha=this.convoyBodyAlert;c.drawImage(canvas,f.ox,f.oy,f.ow||f.w,f.oh||f.h);c.restore();};

const drawHazard=v.drawZergBossHazard;v.drawZergBossHazard=function(f){if(!f.nativeSpikes)return drawHazard.call(this,f);const c=this.ctx;if(f.age<0){const q=1+f.age/f.warning;c.save();c.strokeStyle='#dfa55b';c.fillStyle='#9b623a22';c.lineWidth=1.5/(this.zoom||1);c.globalAlpha=.3+q*.4;c.beginPath();c.ellipse(f.x,f.y,38,17,0,0,Math.PI*2);c.fill();c.stroke();c.restore();return;}
 if(f.spikeIndex%2===1&&f.age<2.2)this.sprite('escort-dust/'+Math.min(10,Math.floor(f.age/.2)),f.x,f.y,2,false,0,.65);
 if(f.age<1.2)this.sprite('escort-spikes/'+Math.min(11,Math.floor(f.age/.1)),f.x,f.y,1.5);
};
v.escortBob=function(){return Math.sin(this.game.time*.85)*4;};
v.escortTransform=function(){this.ctx.translate(1900,2250+this.escortBob());this.ctx.scale(1.15,1.15);this.ctx.translate(-1900,-2250);};
// The platform belongs to the ground pass; the hull is foreground over boarding trucks.
v.sprite=function(name,...args){if(name==='escort-starship'){this.drawEscortDock();return;}if(this.boardingAlpha!=null)args[5]=(args[5]??1)*this.boardingAlpha;const result=sprite.call(this,name,...args);if(this.convoyBodyAlert>0&&name.startsWith("convoy"))this.drawConvoyRedBody(name,...args);return result;};
v.drawEscortHover=function(){const c=this.ctx,t=this.game.time;c.save();
 const shadow=c.createRadialGradient(1910,2380,30,1910,2380,330);shadow.addColorStop(0,'#02070dd0');shadow.addColorStop(1,'#02070d00');c.fillStyle=shadow;c.fillRect(1570,2060,680,650);
 // Six downward jets are drawn behind the original hull; no movement of the dock.
 for(const [i,n]of [[1680,2384],[1820,2350],[1960,2312],[2080,2280],[2182,2220],[1990,2178]].entries()){
  const [x,y]=n,pulse=.9+.07*Math.sin(t*15+i*2)+.04*Math.sin(t*27+i),len=(65+i%3*12)*pulse;
  const glow=c.createRadialGradient(x,y+len,2,x,y+len,66);glow.addColorStop(0,'#ffad5b48');glow.addColorStop(.35,'#69cfff20');glow.addColorStop(1,'#367fff00');c.fillStyle=glow;c.beginPath();c.ellipse(x,y+len,66,24,0,0,Math.PI*2);c.fill();
  c.globalCompositeOperation='lighter';const flame=c.createLinearGradient(x,y,x,y+len);flame.addColorStop(0,'#f1fbff');flame.addColorStop(.18,'#80dfffdd');flame.addColorStop(.48,'#59a6ff88');flame.addColorStop(.73,'#ffb16b66');flame.addColorStop(1,'#ff7c2800');c.fillStyle=flame;c.beginPath();c.moveTo(x-12,y);c.bezierCurveTo(x-18,y+len*.3,x-5,y+len*.8,x,y+len);c.bezierCurveTo(x+7,y+len*.75,x+17,y+len*.3,x+12,y);c.closePath();c.fill();c.globalCompositeOperation='source-over';
 }c.restore();};
v.drawEscortHullLights=function(){const c=this.ctx,t=this.game.time;c.save();c.globalCompositeOperation='lighter';
 for(const [x,y,w]of [[1750,2319,15],[1815,2296,20],[1880,2275,17],[1984,2215,12],[2015,2187,14],[2130,2233,17]]){c.shadowColor='#74d9ff';c.shadowBlur=11;c.fillStyle='#8cdfff';c.fillRect(x,y,w,2);}
 c.shadowBlur=8;c.shadowColor='#ffc46a';c.strokeStyle='#ffce8270';c.lineWidth=2;c.beginPath();c.moveTo(1620,2376);c.lineTo(1930,2182);c.stroke();
 for(const [i,q]of [[1580,2412],[2195,2140],[2040,2089]].entries()){c.globalAlpha=.3+.7*Math.pow(Math.max(0,Math.sin(t*2.6+i*2)),6);c.fillStyle=i===1?'#ff7657':'#b8edff';c.beginPath();c.arc(q[0],q[1],3,0,Math.PI*2);c.fill();}c.restore();};
v.drawEscortDock=function(){const c=this.ctx;c.save();c.translate(1630,2160);c.rotate(Math.atan2(70,115));
 // A narrow approach extends beneath the hull rather than over the upper deck.
 const deck=c.createLinearGradient(0,-52,0,52);deck.addColorStop(0,'#53616a');deck.addColorStop(.12,'#26323a');deck.addColorStop(.85,'#17242d');deck.addColorStop(1,'#65727a');c.fillStyle=deck;c.strokeStyle='#101c25';c.lineWidth=5;c.beginPath();c.moveTo(-90,-40);c.lineTo(-78,-52);c.lineTo(156,-52);c.lineTo(168,-40);c.lineTo(168,40);c.lineTo(156,52);c.lineTo(-78,52);c.lineTo(-90,40);c.closePath();c.fill();c.stroke();
 c.strokeStyle='#79878c55';c.lineWidth=1;for(let x=-70;x<160;x+=28){c.beginPath();c.moveTo(x,-46);c.lineTo(x,46);c.stroke();}
 for(const side of [-1,1])for(let x=-72;x<150;x+=26){c.fillStyle='#d7a750';c.fillRect(x,side*45-2,11,4);c.fillStyle='#8de7ff';c.shadowColor='#6bcfff';c.shadowBlur=6;c.fillRect(x,side*35-2,7,3);}c.shadowBlur=0;
 c.strokeStyle='#b5e5ef';c.lineWidth=2;for(let x=-48;x<140;x+=48){c.globalAlpha=.25+.65*((this.game.time*.65-x/250)%1+1)%1;c.beginPath();c.moveTo(x-8,-8);c.lineTo(x+2,0);c.lineTo(x-8,8);c.stroke();}c.restore();};
const gear=v.drawVehicleGear;v.drawVehicleGear=function(air){gear.call(this,air);if(!air)return;const c=this.ctx;
 c.save();this.escortTransform();this.drawEscortHover();c.restore();
 for(const truck of this.game.boardingConvoys||[]){const t=Math.min(1,truck.boardAge/2.6),x=truck.sx+(1780-truck.sx)*t,y=truck.sy+(2255-truck.sy)*t;c.save();this.boardingAlpha=Math.min(1,(1-t)*4);this.anim('convoy','walk',x,y+this.escortBob()*t,1.1-t*.12,Math.atan2(2255-truck.sy,1780-truck.sx),truck.age+truck.boardAge);this.boardingAlpha=null;c.restore();}
 sprite.call(this,'escort-starship',1900,2250+this.escortBob());c.save();this.escortTransform();this.drawEscortHullLights();c.restore();
};
}
const api={prepare,install};if(typeof module!=='undefined')module.exports=api;else globalThis.ZergOneRuntime=api;
})();
