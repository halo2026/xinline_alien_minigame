const test=require('node:test'),assert=require('node:assert/strict'),C=require('../shared/core'),factory=require('../shared/defense-campaign'),art=require('../shared/defense-art');
const stages={zerg:{core:C},mine4:require('../shared/mine4'),zerg1:require('../shared/zerg1'),greenstar:require('../shared/greenstar')};
for(const name of ['snake3','airship3','fish3','fortress2','scorpion2'])stages[name]=factory.create(require('../shared/'+name+'-data'),art);
const ids=[913000,912200,915000,916000];
for(const [name,stage] of Object.entries(stages))for(const [choice,id] of ids.entries())test(`${name}: midpoint choice ${id} occurs once with working skills and no act-ending death`,()=>{
 const g=new stage.core.Game({seed:128}),seen=[];g.start();const midpoint=g.firstWaves+Math.ceil(g.firstWaves/2);
 for(let wave=1;wave<=g.totalWaves;wave++){
  if(wave>1){const random=g.random;g.random=()=> (choice+.5)/4;g.beginWave();g.random=random;}
  assert(!g.enemies.some(e=>e.id===915001&&!e.campaignFinalBoss),`no thunderbeast in wave ${wave}`);
  assert(!g.pending.some(e=>e.unit===915001&&!e.campaignFinalBoss),`no queued thunderbeast in wave ${wave}`);
  const bosses=g.enemies.filter(e=>ids.includes(e.id));seen.push(...bosses);
  assert.equal(bosses.length,wave===midpoint?1:0,`wave ${wave}`);
  assert(!g.pending.some(e=>ids.includes(e.unit)));
  if(wave===midpoint){const e=bosses[0];assert.equal(e.id,id);assert(g.hasGround(e.x,e.y));assert(!g.nav.blocked(e.x,e.y));assert(e.largeEncounter);assert.equal(g.largeEncounter.wave,midpoint);
   const hp=g.refinery.hp;g.player.hp=0;g.yoda.hp=0;
   if(id===913000){g.time+=2.1;g.updateCampaignEnemy(e,g.refinery,.1);assert.equal(e.phase,'birth');g.time+=3.1;g.updateCampaignEnemy(e,g.refinery,.1);assert.equal(e.phase,'idle');g.time+=2.1;g.updateCampaignEnemy(e,g.refinery,.1);assert.equal(e.phase,'aim');g.time+=1.7;g.updateCampaignEnemy(e,g.refinery,.1);assert.equal(e.phase,'spray');g.time+=.5;g.updateCampaignEnemy(e,g.refinery,.1);assert.equal(g.mantisLava.length,1);g.updateAirshipGround(.1);assert(g.refinery.hp<hp);}
   if(id===912200){g.time+=1.9;g.updateCampaignEnemy(e,g.refinery,.1);assert.equal(e.phase,'emerge');g.time+=4.3;g.updateCampaignEnemy(e,g.refinery,.1);assert.equal(e.phase,'attack');g.castBrainSkill(e);assert(g.fx.some(f=>f.owner===e&&f.skill==='corrosion'));g.castBrainSkill(e);assert.equal(g.fx.filter(f=>f.giantBrainSpike).length,20);e.nextBurrowAt=g.time;g.updateCampaignEnemy(e,g.refinery,.1);assert.equal(e.phase,'dig');}
   if(id===915000){Object.assign(e,{x:g.refinery.x+250,y:g.refinery.y,nextSkill:0});g.updateCampaignEnemy(e,g.refinery,.1);assert.equal(e.swarm.length,6);const d=e.swarm[0];g.time+=.3;g.updateCampaignEnemy(d,g.refinery,.1);assert.equal(d.phase,'outbound');}
   if(id===916000){g.time+=2.1;g.updateCampaignEnemy(e,g.refinery,.1);assert(!e.hidden);g.mechanicalShots=[];g.castSnakeSkill(e,'volley',g.refinery);assert.equal(g.mechanicalShots.length,21);assert(e.mechanicalSnake);}
   e.hidden=false;g.damage(e,e.hp+1);assert(!g.bossDeath);assert(!g.victoryAt);assert.equal(g.state,'playing');g.refinery.hp=hp;
  }
  g.enemies=[];g.pending=[];g.chests=[];
 }
 assert.equal(seen.length,1);
 const progress=g.saveProgress();progress.campaignActs??={};progress.campaignActs[name]={act:2};const resumed=new stage.core.Game({progress});resumed.start();assert.equal(resumed.wave,g.firstWaves+1);resumed.wave=midpoint-1;resumed.beginWave();assert.equal(resumed.enemies.filter(e=>ids.includes(e.id)).length,1);
});
test('mantis body contact follows mirror/scale and rejects the ground beneath its legs',()=>{
 const g=new C.Game(),e=g.spawnMantisEncounter();Object.assign(e,{x:800,y:800,phase:'idle',hidden:false,angle:Math.PI});
 for(const scale of [1,1.3175,2]){e.scale=scale;const q=g.aimPoint(e);assert.equal(q.y,800-112*scale);assert.deepEqual(g.center(e),q);assert(g.mantisProjectileContact(e,{x:1000,y:q.y},600,q.y));assert.equal(g.mantisProjectileContact(e,{x:1000,y:800},600,800),null);e.angle=0;assert.equal(g.aimPoint(e).x,1600-q.x);e.angle=Math.PI;}
});
test('actual bullets and tracking energy hit the raised mantis body',()=>{
 const g=new C.Game();g.start();const e=g.spawnMantisEncounter();Object.assign(e,{x:900,y:1000,phase:'idle',hidden:false,nextLavaAt:Infinity,angle:Math.PI});g.enemies=[e];g.chests=[];g.pending=[];g.nextWave=Infinity;g.player.fireCd=Infinity;g.yoda.hp=0;g.nav.blocked=()=>false;g.updateCampaignEnemy=()=>true;
 const q=g.aimPoint(e),hp=e.hp;g.bullets=[{kind:'bullet',x:q.x-100,y:q.y,vx:2000,vy:0,angle:0,damage:123,age:0,life:2,hit:new Set()}];g.update(.1);assert.equal(e.hp,hp-123);assert(g.fx.some(f=>Math.abs(f.y-q.y)<1));
 const b={kind:'energy',x:q.x-10,y:q.y,speed:420,life:1,age:0,hit:new Set(),damage:77,target:e};g.updateHomingEnergy(b,.1);assert.equal(e.hp,hp-200);assert.equal(b.y,q.y);
 Object.assign(g.player,{x:q.x-160,y:e.y});g.fire(g.player,'laser',{target:e});const shot=g.bullets.at(-1);assert(Math.abs(shot.angle-Math.atan2(q.y-g.player.y,q.x-g.player.x))<1e-9);
});
