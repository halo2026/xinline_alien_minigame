const test=require('node:test'),assert=require('node:assert/strict'),S=require('../shared/mine4'),P=require('../shared/progression'),M=require('../shared/mission-menu');
test('mine4 is the second chapter and its progress, supplies and rewards survive reload',()=>{
 assert.deepEqual(M.missions.slice(0,3).map(m=>m.id),['zerg','mine4','zerg1']);
 const p=P.fresh();p.campaignActs={mine4:{act:3,gold:1234}};p.campaignClears={mine4:true};p.pendingCampaignSupplies={id:'mine4',gold:321,cards:{}};P.grantActReward(p,'mine4',1);const q=P.restore(p);assert(q.campaignClears.mine4);assert.equal(q.campaignActs.mine4.gold,1234);assert.equal(q.pendingCampaignSupplies.id,'mine4');assert(q.actFirstClearRewards['mine4:1']);
 const v=new S.api.View({}, {pages:[]},390,844);assert.equal(v.nextCampaign().id,'zerg1');assert(M.unlocked({campaignClears:{zerg:true}},1));assert(!M.unlocked({campaignClears:{zerg:true}},2));
});
test('two-turn route remains walkable and tower terrace is buildable while roads are protected',()=>{
 const g=new S.core.Game();g.start();assert.equal(S.layout.turns,2);for(const p of S.layout.route)assert(!g.nav.blocked(p.x,p.y));assert(S.layout.platform.filter(p=>!g.buildSiteError(p.x,p.y)).length>80);for(const p of S.layout.route.slice(0,-2))assert(g.buildSiteError(p.x,p.y));assert.equal(g.chests.filter(e=>e.insectNest).length,0);g.initMining();assert(g.miningSites.length>0);
 const t=S.layout.platform.find(p=>!g.buildSiteError(p.x,p.y));assert(g.nav.route(g.player,t).length>0);
});
test('ground enemies follow the full spiral without chasing across rings and then damage the refinery',()=>{
 const g=new S.core.Game();g.start();g.pending=[];g.player.hp=1e9;g.refinery.hp=1e9;
 const e=g.spawn(S.data.waves[0][0]);let previous=0;const hp=g.refinery.hp;
 for(let i=0;i<18000&&e.wp<e.waypoints.length;i++){g.player.x=e.x+5;g.player.y=e.y;g.updateCampaignEnemy(e,g.player,.05);assert(e.wp>=previous);previous=e.wp;assert(S.layout.distance(e,S.layout.route)<25);assert.equal(g.refinery.hp,hp);}
 assert.equal(e.wp,e.waypoints.length);g.updateCampaignEnemy(e,g.player,.05);assert(g.refinery.hp<hp);
});
test('both acts schedule all seven waves and retain their final bosses',()=>{
 for(let i=0;i<14;i++){const batch=S.core.scheduleWave(i,0);assert(batch.length>=18);assert(batch.every(e=>(e.spawn===1||e.spawn===3||i>=7&&e.spawn===2)&&e.path===1));assert.equal(batch.filter(e=>e.unit===12504).length,i===13?2:i===6?1:0);assert.equal(batch.filter(e=>e.unit===915001).length,0);}
 const g=new S.core.Game();g.start();g.wave=7;g.enemies=[];g.pending=[];g.update(.05);assert.equal(g.state,'settlement');g.beginCleanup();g.beginSecondAct();assert.equal(g.wave,8);g.wave=14;g.enemies=[];g.pending=[];g.update(.05);assert.equal(g.state,'won');assert(P.restore(g.saveProgress()).campaignClears.mine4);
});
test('packaged mine4 loads with mapped assets and keeps the same route',()=>{
 const packed=require('../minigame/shared/mine4'),files=require('../minigame/shared/game-assets').files;assert(files['mine4-terrain.jpg']);assert(files['campaign-nodes.png']);for(const f of packed.art.pages)assert(files[f],f);const g=new packed.core.Game();g.start();for(let i=0;i<120;i++)g.update(.05);assert.equal(g.campaignId,'mine4');assert(g.enemies.some(e=>e.mineRoute));assert.deepEqual(packed.layout.route,S.layout.route);
});
test('stationary vehicle keeps position and facing, fires grenades and collects distant rewards',()=>{
 const g=new S.core.Game();g.start();g.pending=[];const origin={x:g.player.x,y:g.player.y},pet={x:g.yoda.x,y:g.yoda.y};g.move={x:1,y:0};g.addGroundPickup({...S.layout.route[20],crystals:20});const gold=g.gold;for(let i=0;i<20;i++)g.update(.05);assert(g.towerDefense);assert.equal(g.player.x,origin.x);assert.equal(g.player.y,origin.y);assert.equal(g.yoda.x,pet.x);assert.equal(g.yoda.y,pet.y);assert.equal(g.player.angle,S.layout.playerStart.angle);assert(g.throwGrenade());assert(g.bullets.some(b=>b.kind==='grenade'));g.gainExperience(P.thresholds[1]);assert.equal(g.progress.level,2);assert.equal(g.gold,gold+20);assert.equal(g.pickups.length,0);
});
test('map dragging pans without building; tap builds; cancelled gesture does nothing',()=>{
 for(const [w,h]of [[390,844],[844,390]]){const v=new S.api.View({}, {pages:[]},w,h),g=v.game;g.progress.mine4IntroSeen=true;g.stationaryIntroAcknowledged=true;g.start();v.inventoryOpen=false;v.techTower=null;v.pendingTechnologyGiftKey=()=>null;v.updateCamera();let placed=0;g.buildSelected=12200;g.placeTower=()=>{placed++;return true;};const x=w*.4,y=h*.4,before=v.camera.x;v.down(1,x,y);v.motion(1,x+50,y);v.up(1,x+50,y);assert.notEqual(v.camera.x,before);assert.equal(placed,0);v.down(2,x,y);v.up(2,x,y);assert.equal(placed,1);v.down(3,x,y);v.up(3,x,y,true);assert.equal(placed,1);v.down(4,x,y);v.resize(w,h);assert.equal(v.mineDrag,null);}
});
test('stationary mode preserves tower projectiles and vehicle weapons',()=>{
 const g=new S.core.Game();g.start();const t={id:12200,x:1000,y:1100,angle:0,techRank:0};
 for(const kind of ['bullet','energy','frost','laser','wave']){g.bullets=[];g.fire(t,kind);assert(g.bullets.length>0,kind);assert(g.bullets.every(b=>b.kind===kind));if(kind==='wave')assert(g.bullets.length>=2);}
 const n=g.bullets.length;g.fire();g.fire(g.player);assert(g.bullets.length>n);
});
test('mine4 towers acquire nearby enemies and inflict damage during real updates',()=>{
 for(const id of [12200,12202,12204,12205]){const g=new S.core.Game();g.start();g.pending=[];g.nextWave=Infinity;const q=S.layout.platform[45],t={id,...q,angle:0,cd:0,life:Infinity,techRank:0,builtAt:-10};g.towers=[t];const e=g.spawn(S.data.waves[0][0]);Object.assign(e,{x:q.x+180,y:q.y,hp:100000,maxHp:100000,speed:0,scale:1.2});for(let i=0;i<100;i++)g.update(.05);assert(e.hp<100000,'tower '+id+' must damage its target');}
});
test('dragons enter only in act two, fly straight across the pit and attack the refinery',()=>{
 for(let i=0;i<14;i++)assert.equal(S.core.scheduleWave(i,0).filter(e=>e.unit===12509).length,i<7?0:4+(i-7)*2);
 const g=new S.core.Game();g.start();g.pending=[];g.nextWave=Infinity;g.player.fireCd=Infinity;const cmd=S.core.scheduleWave(7,0).find(e=>e.unit===12509),e=g.spawn(cmd),hp=g.refinery.hp;let crossed=false;for(let i=0;i<1600&&g.refinery.hp===hp;i++){g.update(.05);assert(Math.abs((e.x-S.layout.center.x)*(g.refinery.y-S.layout.center.y)-(e.y-S.layout.center.y)*(g.refinery.x-S.layout.center.x))<.001);if(!g.hasGround(e.x,e.y))crossed=true;}assert(crossed);assert(g.refinery.hp<hp);assert.equal(e.wp,0);
});
test('mine enemy health scales include the strengthened boss',()=>{
 const g=new S.core.Game();for(const cmd of S.core.scheduleWave(6,0)){const e=g.spawn(cmd),before=g.spawn({...cmd,hpScale:1.3});assert(Math.abs(e.maxHp/before.maxHp-(cmd.unit===12504?4/3:cmd.unit===12500?1.8:cmd.unit===914104?8/1.3:1.5))<1e-9);}
});
test('mine melee and ranged attack animations restart on successive attacks',()=>{
 for(const id of [12500,12502,12503,12504,12509]){const g=new S.core.Game();g.start();g.pending=[];g.nextWave=Infinity;g.refinery.hp=1e8;const e=g.spawn({unit:id,spawn:1,path:1});Object.assign(e,{x:g.refinery.x,y:g.refinery.y-70,wp:e.waypoints.length,cd:0});let resets=0,advanced=false,last=0;for(let i=0;i<240;i++){g.update(.05);if(e.action==='attack'){if(e.animAge===0)resets++;if(e.animAge>last)advanced=true;}last=e.animAge;}assert(resets>=2,'repeated attack '+id);assert(advanced,'animated frames '+id);assert(g.refinery.hp<1e8,'damage '+id);}
});

test('stationary vehicle respawns in its bay and touch gestures never create a movement stick',()=>{
 const g=new S.core.Game();g.start();g.pending=[];g.nextWave=Infinity;g.player.shield=0;g.hurt(g.player,g.player.hp*100);for(let i=0;i<500;i++)g.update(.05);assert(g.player.hp>0);assert.equal(g.player.x,S.layout.playerStart.x);assert.equal(g.player.angle,S.layout.playerStart.angle);
 for(const [w,h]of [[390,844],[844,390]]){const v=new S.api.View({}, {pages:[]},w,h);v.game.progress.mine4IntroSeen=true;v.game.stationaryIntroAcknowledged=true;v.game.start();v.inventoryOpen=false;v.pendingTechnologyGiftKey=()=>null;v.updateCamera();v.down(1,w*.3,h*.4);v.motion(1,w*.3+40,h*.4);v.up(1);assert.deepEqual(v.touchIds,{});assert.deepEqual(v.game.move,{x:0,y:0});const r=v.grenadeLayout();v.down(2,r.x,r.y);assert(v.game.bullets.some(b=>b.kind==='grenade'));}
});

test('entry instructions freeze the battle and require confirmation on each entry',()=>{
 for(const [w,h]of [[390,844],[844,390]]){const v=new S.api.View({}, {pages:[]},w,h),g=v.game;g.start();assert(v.mineIntroActive());const time=g.time,pending=g.pending.length;for(let i=0;i<100;i++)v.step(.1);assert.equal(g.time,time);assert.equal(g.pending.length,pending);const grenade=v.grenadeLayout();v.down(1,grenade.x,grenade.y);assert.equal(g.bullets.length,0);assert(v.mineIntroActive());const r=v.mineIntroLayout().close;v.down(2,r.x+r.w/2,r.y+r.h/2);assert(!v.mineIntroActive());assert.equal(g.state,'playing');v.step(.1);assert(g.time>time);const saved=P.restore(g.saveProgress());assert(saved.mine4IntroSeen);const next=new S.api.View({}, {pages:[]},w,h,0,{load:()=>saved});assert(next.mineIntroActive());}
});

test('parked vehicle repair device reaches the repositioned mine refinery during battle',()=>{
 const g=new S.core.Game();const item={id:41051,uid:g.progress.nextUid++};g.progress.inventory.push(item);g.progress.equipped[2]=item.uid;g.applyEquipment();g.start();g.pending=[];g.nextWave=Infinity;g.refinery.hp-=1000;const hp=g.refinery.hp;assert(Math.hypot(g.player.x-g.refinery.x,g.player.y-g.refinery.y)<180);for(let i=0;i<20;i++)g.update(.05);assert(Math.abs(g.refinery.hp-hp-50)<.001);assert(g.gearRepairs.includes(g.refinery));
});

test('stationary speed button doubles only battle time and respects pause and introduction',()=>{
 for(const [w,h]of [[390,844],[844,390],[320,568]]){const v=new S.api.View({}, {pages:[]},w,h),g=v.game;g.progress.mine4IntroSeen=true;g.stationaryIntroAcknowledged=true;g.start();g.pending=[];g.nextWave=Infinity;v.pendingTechnologyGiftKey=()=>null;const r=v.battleSpeedLayout();v.down(1,r.x+22,r.y+14);assert.equal(g.battleSpeed,2);const t=g.time;v.step(.05);assert(Math.abs(g.time-t-.1)<1e-9);assert.equal(v.uiEffectTime,.05);v.paused=true;v.step(.05);assert(Math.abs(g.time-t-.1)<1e-9);v.paused=false;g.progress.mine4IntroSeen=false;g.stationaryIntroAcknowledged=false;v.step(.05);assert(Math.abs(g.time-t-.1)<1e-9);g.progress.mine4IntroSeen=true;g.stationaryIntroAcknowledged=true;v.down(2,r.x+22,r.y+14);assert.equal(g.battleSpeed,1);v.step(.05);assert(Math.abs(g.time-t-.15)<1e-9);assert.deepEqual(v.touchIds,{});}
});

test('stationary map gestures yield to every tactical introduction and grenade hint',()=>{
 for(const [w,h]of [[390,844],[844,390]])for(let card=12013;card<=12025;card++){
 const v=new S.api.View({}, {pages:[]},w,h),g=v.game;g.progress.mine4IntroSeen=true;g.stationaryIntroAcknowledged=true;g.progress.battleIntroStep=3;g.start();v.pendingTechnologyGiftKey=()=>null;v.updateCamera();v.bindCombatHints();if(!g.tacticalCardEnabled(card))continue;g.cards[card]={count:2,ready:0,level:1};
 v.down(1,w*.4,h*.4);assert(v.mineDrag);assert.equal(g.useCard(card),false);assert(v.combatHintActive());const camera={...v.camera};v.motion(1,w*.4+50,h*.4);v.up(1);assert.deepEqual(v.camera,camera);assert.equal(v.mineDrag,null);
 const r=v.combatHintLayout().button;v.down(2,r.x+r.w/2,r.y+r.h/2);v.up(2);assert.equal(v.pendingTacticalIntro,null);assert.equal(g.cards[card].count,1);assert(g.progress.tacticalIntroSeen.includes(card));assert.deepEqual(v.camera,camera);
 g.progress.grenadeKillHintPending=true;assert(v.combatHintActive());v.down(3,r.x+10,r.y+10);assert(g.progress.grenadeKillHintSeen);assert(!v.combatHintActive());
 }
});

test('elite worms join selected waves between ordinary arrivals and follow the mine route',()=>{
 const counts=[0,3,0,4,5,0,6],g=new S.core.Game();g.start();for(let i=0;i<14;i++){const batch=S.core.scheduleWave(i,0),elites=batch.filter(e=>e.mineWormElite),ordinary=batch.filter(e=>e.spawn===1);assert.equal(elites.length,counts[i%7]);if(!elites.length)continue;assert(elites[0].time>ordinary[0].time&&elites[0].time<ordinary.at(-1).time);const e=g.spawn(elites[0]);assert.equal(e.monsterName,'蠕虫精英');assert(e.maxHp>=7200*.85);assert.equal(e.scale,1.45);assert(e.mineRoute);assert(e.waypoints.length>200);const prev={x:e.x,y:e.y};g.updateCampaignEnemy(e,g.refinery,.1);assert(Math.hypot(e.x-prev.x,e.y-prev.y)>0);assert(S.art.groups[e.id].anim.walk);}
});

test('mine second-act restores the directional boss, attacks, drops rewards and completes the campaign',()=>{
 const cmd=S.core.scheduleWave(13,0).find(e=>e.unit===12504);assert(cmd);const g=new S.core.Game();g.start();g.wave=14;g.pending=[];g.chests=[];const e=g.spawn(cmd);g.enemies=[e];assert(e.boss&&!e.mailMonster);assert.equal(S.art.groups[e.id].dirs,8);assert(e.waypoints.length>200);const start={x:e.x,y:e.y};g.updateCampaignEnemy(e,g.refinery,.1);assert(Math.hypot(e.x-start.x,e.y-start.y)>0);e.wp=e.waypoints.length;e.x=g.refinery.x+50;e.y=g.refinery.y;e.cd=0;const hp=g.refinery.hp;g.updateCampaignEnemy(e,g.refinery,.05);assert(g.refinery.hp<hp);let rewards=0;g.dropBossRewards=()=>rewards++;e.hp=0;g.kill(e);assert.equal(rewards,1);g.enemies=[];g.time=g.victoryAt+.1;g.update(.01);assert.equal(g.state,'won');assert(g.progress.campaignClears.mine4);
});

test('native boss occasionally uses haste at three to four times walking speed along the road',()=>{
 const g=new S.core.Game();g.start();const e=g.spawn(S.core.scheduleWave(13,0).find(c=>c.unit===12504));g.random=()=>.5;g.time=20;e.hasteAt=20;e.animAge=0;Object.assign(e,S.layout.route[0]);const start={x:e.x,y:e.y};g.updateCampaignEnemy(e,g.refinery,.01);const distance=Math.hypot(e.x-start.x,e.y-start.y);assert(Math.abs(distance-e.speed*.01*3.5)<.001);assert.equal(e.zergSkillName,'疾行');assert(e.hasteAt>=28&&e.hasteAt<=33);assert(S.layout.distance(e,S.layout.route)<.001);assert(Math.abs(e.hasteUntil-20-.7*4/3)<1e-9);g.time=20.8;assert.equal(g.mineHasteMultiplier(e),3.5);g.time=e.hasteUntil;assert.equal(g.mineHasteMultiplier(e),1);g.time=e.hasteAt;assert.equal(g.mineHasteMultiplier(e),3.5);
});

test('holding the parked vehicle turns its body without moving or panning, and aims grenades',()=>{
 for(const [w,h]of [[390,844],[844,390]]){const v=new S.api.View({}, {pages:[]},w,h),g=v.game;g.progress.mine4IntroSeen=true;g.stationaryIntroAcknowledged=true;g.start();v.pendingTechnologyGiftKey=()=>null;v.updateCamera();const r=v.stationaryTurnLayout(),camera={...v.camera},pos={x:g.player.x,y:g.player.y};v.down(50,r.x,r.y);assert(v.mineRotate);v.motion(50,r.x,r.y-45);assert.equal(g.player.angle,-Math.PI/2);g.update(.05);assert.equal(g.player.angle,-Math.PI/2);assert.equal(g.player.x,pos.x);assert.equal(g.player.y,pos.y);assert.deepEqual(v.camera,camera);v.up(50);assert.equal(v.mineRotate,null);assert(g.throwGrenade());const b=g.bullets.find(b=>b.kind==='grenade');assert(Math.abs(b.tx-pos.x)<.001);assert.equal(b.ty,pos.y-180);v.down(51,r.x,r.y);v.resize(w,h);assert.equal(v.mineRotate,null);}
});

test('asteroid mask keeps combat terraces solid, exterior transparent and terrain cached',async()=>{
 const {createCanvas,loadImage}=require('@napi-rs/canvas'),path=require('node:path'),terrain=await loadImage(path.resolve(__dirname,'../assets/mine4-terrain.jpg')),mask=await loadImage(path.resolve(__dirname,'../assets/mine4-mask.png')),previous=global.OffscreenCanvas;
 global.OffscreenCanvas=function(w,h){return createCanvas(w,h);};
 try{
  const v=new S.api.View(createCanvas(390,844).getContext('2d'),{terrain,pages:S.art.pages.map(f=>f==='mine4-mask.png'?mask:null)},390,844),image=v.terrainImage(),ctx=image.getContext('2d'),b=S.layout.terrainBounds;
  assert.equal(v.terrainImage(),image);assert.equal(ctx.getImageData(0,0,1,1).data[3],0);assert.equal(ctx.getImageData(image.width-1,image.height-1,1,1).data[3],0);
  const alpha=(x,y)=>ctx.getImageData(Math.floor((x-b.x)/b.w*image.width),Math.floor((y-b.y)/b.h*image.height),1,1).data[3];
  for(const p of [...S.layout.route,...S.layout.platform])assert.equal(alpha(p.x,p.y),255,`combat land ${p.x},${p.y}`);
  assert(alpha(1152,2950)>200,'thick lower cliff');
  v.game.start();v.updateCamera();v.camera.y=1e6;v.updateCamera();assert(v.camera.y+v.h/v.zoom/2>=3100,'camera exposes full cliff');
 }finally{global.OffscreenCanvas=previous;}
});

 test('mine final act schedules two strengthened bosses ten seconds apart',()=>{const a=S.core.scheduleWave(6,0).filter(e=>e.unit===12504),b=S.core.scheduleWave(13,0).filter(e=>e.unit===12504);assert.equal(a.length,1);assert.equal(b.length,2);assert.equal(b[1].time-b[0].time,10);const g=new S.core.Game();for(const cmd of [...a,...b]){const e=g.spawn(cmd),old=g.spawn({...cmd,hpScale:cmd.hpScale*3/4});assert(Math.abs(e.maxHp/old.maxHp-4/3)<1e-9);}});
