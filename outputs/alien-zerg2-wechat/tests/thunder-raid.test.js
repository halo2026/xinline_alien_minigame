const test=require('node:test'),assert=require('node:assert/strict'),S=require('../shared/thunder-raid'),P=require('../shared/progression'),M=require('../shared/mission-menu');
function game(){const g=new S.core.Game();g.start();return g;}
test('mission inserted after mothership with persisted act rewards and next-stage transitions',()=>{const i=M.missions.findIndex(m=>m.id==='thunderraid');assert.equal(M.missions[i-1].id,'airship3');assert.equal(M.missions[i+1].id,'greenstar');const s=P.fresh();assert(!M.unlocked(s,i));s.campaignActs={airship3:{act:3},thunderraid:{act:2,cards:[]}};s.campaignClears={airship3:true};s.pendingCampaignSupplies={id:'thunderraid',gold:2000,cards:[]};assert(M.unlocked(s,i));assert.equal(P.grantActReward(s,'thunderraid',1),10);const loaded=P.restore(JSON.stringify(s));assert.equal(loaded.campaignActs.thunderraid.act,2);assert.equal(loaded.pendingCampaignSupplies.id,'thunderraid');assert.equal(P.grantActReward(loaded,'thunderraid',1),0);const v=new S.api.View({}, {},390,844);assert.equal(v.nextCampaign().id,'greenstar');assert.equal(new S.core.Game({progress:loaded}).wave,8);});
test('two independent refineries, free vehicle and all roads remain navigable',()=>{const g=game();assert.equal(g.refineries.length,2);assert(!g.stationaryVehicle&&!g.towerDefense);assert.equal(g.refineries[0].hp,60000);for(const r of S.layout.routes){let length=0;for(let i=1;i<r.length;i++){length+=Math.hypot(r[i].x-r[i-1].x,r[i].y-r[i-1].y);for(let t=0;t<=1;t+=.1)assert(!g.nav.blocked(r[i-1].x+(r[i].x-r[i-1].x)*t,r[i-1].y+(r[i].y-r[i-1].y)*t));}assert(length>2700*S.layout.worldScale);}g.hurt(g.refineries[1],500);assert.equal(g.refinery.hp,60000);assert.equal(g.refineries[1].hp,59500);assert.equal(game().refineries[1].hp,60000);});
test('first act has three single thunders; second act has three pairs spaced three seconds',()=>{const g=game();assert.equal(g.totalWaves,16);for(let w=0;w<16;w++){const batch=S.core.scheduleWave(w,0);for(const path of [1,2])assert(batch.some(e=>e.path===path));const thunder=batch.filter(e=>e.raidThunder);assert.equal(thunder.length,[2,5,7].includes(w%8)?(w<8?1:2):0);if(thunder.length===2)assert.equal(thunder[1].time-thunder[0].time,3);for(const cmd of thunder)assert.equal(g.spawn(cmd).scale,.9);assert.equal(batch.some(e=>e.unit===12509),[1,3,4,6,7].includes(w%8));}});
test('ordinary and thunder units follow both complete roads, accelerate without cutting corners and damage matching mine',()=>{for(const lane of [0,1])for(const unit of [12500,12509,915001]){const g=game(),cmd=S.core.scheduleWave(15,0).find(c=>c.unit===unit&&(c.raidThunder?c.ordinal===lane:c.path===lane+1)),e=g.spawn(cmd);g.enemies=[e];g.random=()=>.5;g.time=20;e.advanceAt=20;const start={x:e.x,y:e.y};g.updateCampaignEnemy(e,g.refinery,.01);if(unit===915001)assert(Math.abs(Math.hypot(e.x-start.x,e.y-start.y)-e.speed*.035)<.001);let ticks=0;while(e.wp<e.waypoints.length&&ticks++<10000){g.time+=.1;g.updateCampaignEnemy(e,g.refinery,.1);assert(S.layout.distance(e,S.layout.routes[lane])<.001);}assert(ticks<10000);assert.equal(g.defenseTarget(e),g.refineries[lane]);const hp=g.refineries[lane].hp,other=g.refineries[1-lane].hp;if(unit===915001)Object.assign(e,{phase:'electric',phaseAt:g.time,aim:{...g.refineries[lane]},electricHits:new Set()});e.cd=0;g.updateCampaignEnemy(e,g.refinery,.1);assert(g.refineries[lane].hp<hp);assert.equal(g.refineries[1-lane].hp,other);}});
test('either mine lost fails mission; final clear persists and unlocks next stage',()=>{for(const i of [0,1]){const g=game();g.hurt(g.refineries[i],1e9);assert.equal(g.state,'lost');}const g=game();g.wave=16;g.enemies=[];g.pending=[];g.nextWave=Infinity;g.update(.01);assert.equal(g.state,'won');const s=P.restore(g.saveProgress());assert(s.campaignClears.thunderraid);const index=M.missions.findIndex(m=>m.id==='greenstar');assert(M.unlocked(s,index));});
test('packaged raid startup and maps are available',()=>{const packed=require('../minigame/shared/thunder-raid'),g=new packed.core.Game();g.start();g.update(.016);assert.equal(g.state,'playing');const assets=require('../minigame/shared/game-assets');assert(assets.files['thunderraid-terrain.jpg']);});
test('craters are impassable, transparent, cached and reveal moving space',()=>{
 const {createCanvas,loadImage}=require('@napi-rs/canvas');
 return Promise.all(['thunderraid-terrain.jpg','thunderraid-mask.png'].map(f=>loadImage(require('node:path').resolve(__dirname,'../assets/'+f)))).then(([terrain,mask])=>{
  const previous=global.OffscreenCanvas;global.OffscreenCanvas=function(w,h){return createCanvas(w,h)};
  try{const c=createCanvas(390,844),v=new S.api.View(c.getContext('2d'),{terrain,pages:S.art.pages.map(f=>f==='thunderraid-mask.png'?mask:null)},390,844),g=v.game;g.start();
   const image=v.terrainImage(),ctx=image.getContext('2d');assert.equal(image,v.terrainImage());
   const mc=createCanvas(mask.width,mask.height).getContext('2d');mc.drawImage(mask,0,0);let exposed=0,rock=0;for(let y=0;y<mask.height;y+=19)for(let x=0;x<mask.width;x+=17){if(x>mask.width*.3&&x<mask.width*.7)continue;const alpha=mc.getImageData(x,y,1,1).data[3],actual=ctx.getImageData(x,y,1,1).data[3];if(alpha===0){assert.equal(actual,0);exposed++;}if(alpha===255){assert.equal(actual,255);rock++;}}assert(exposed>100&&rock>100);
   for(const hole of S.layout.craters){assert(!g.hasGround(hole.x,hole.y));assert(g.nav.blocked(hole.x,hole.y));const x=Math.round((hole.x-S.layout.terrainBounds.x)/S.layout.terrainBounds.w*image.width),y=Math.round((hole.y-S.layout.terrainBounds.y)/S.layout.terrainBounds.h*image.height);assert.equal(ctx.getImageData(x,y,1,1).data[3],0);}
   assert.equal(ctx.getImageData(0,0,1,1).data[3],0);assert.equal(ctx.getImageData(Math.floor(image.width/2),image.height-1,1,1).data[3],0);for(const mine of g.refineries){assert(g.hasGround(mine.x,mine.y+250));assert(!g.nav.blocked(mine.x,mine.y+250));}
   const road=S.layout.routes[0][20];assert.equal(ctx.getImageData(Math.round((road.x-S.layout.terrainBounds.x)/S.layout.terrainBounds.w*image.width),Math.round((road.y-S.layout.terrainBounds.y)/S.layout.terrainBounds.h*image.height),1,1).data[3],255);
   const space=require('../shared/space-scene');space.stars(v);const first=c.toBuffer('image/png');g.time+=10;space.stars(v);assert.notDeepEqual(c.toBuffer('image/png'),first);
   for(const mine of g.refineries)assert(g.nav.route(g.player,mine).length>0);
  }finally{global.OffscreenCanvas=previous;}
 });
});

test('opening health, eggs and recurring large harassment are strengthened without stacking giants',()=>{
 const g=new S.core.Game({seed:128});g.start();assert(S.core.scheduleWave(0,0).filter(c=>c.unit===12500).every(c=>c.hpScale>=5));assert(S.core.scheduleWave(1,0).filter(c=>c.unit===12500).every(c=>c.hpScale>=5.5));assert(g.chests.some(c=>c.insectNest));
 for(const choice of [0,1,2]){const h=new S.core.Game({seed:128});h.start();h.wave=3;const random=h.random;h.random=()=> (choice+.5)/3;h.beginWave();h.random=random;const e=h.enemies.find(e=>e.raidHarasser);assert(e);assert.equal(e.id,[913000,912200,915000][choice]);assert.equal(e.raidLane,undefined);h.wave=6;h.beginWave();assert.equal(h.enemies.filter(e=>e.raidHarasser).length,1);}
 for(const c of g.eggClusters||[])for(const egg of c.members){assert(g.hasGround(egg.x,egg.y));assert(!g.nav.blocked(egg.x,egg.y));}
});

test('visible ground beside crater accepts the full tower base; pit, rim and road remain forbidden',()=>{
 const g=game();g.buildSelected=12202;
 // The small crater's eastern dirt pocket was lost to the old ellipse/cell padding.
 assert.equal(g.buildSiteError(518,792),'');assert(g.placeTower(518,792));assert.equal(g.towers.at(-1).x,518);assert.equal(g.towers.at(-1).y,792);
 assert.equal(g.buildSiteError(518,792),'此处与建筑重叠');
 for(const hole of S.layout.craters){assert(g.buildSiteError(hole.x,hole.y));const rim=S.layout.craterRim(hole);for(const point of rim.filter((_,i)=>i%16===0))assert(g.buildSiteError(point.x,point.y));}
 for(const route of S.layout.routes)for(const point of route.filter((_,i)=>i%8===0))assert(g.buildSiteError(point.x,point.y));
 assert(g.buildSiteError(535,792),'moving the base onto the road must fail');
 assert(g.buildSiteError(490,792),'moving the base onto the rim must fail');
});

test('ore rock mining points keep their mining income and do not become collectible pickups',()=>{
 const g=game();g.initMining();assert(g.miners.length>0);const miner=g.miners[0],before=g.gold;miner.phase='unload';miner.timer=.49;g.updateMining(.02);assert(g.gold>before);assert(g.miningSites.length>0);
});
