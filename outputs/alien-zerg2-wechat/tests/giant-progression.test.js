const test=require('node:test'),assert=require('node:assert/strict'),M=require('../shared/tank-mantis');
const ids=['zerg','mine4','zerg1','snake3','airship3','greenstar','fish3','fortress2','scorpion2'];
function make(id){const C=id==='zerg'?require('../shared/core'):['mine4','zerg1','greenstar'].includes(id)?require('../shared/'+id).core:require('../shared/defense-campaign').create(require('../shared/'+id+'-data'),require('../shared/defense-art')).core;const g=new C.Game({seed:42});g.start();g.pending=[];g.yoda.hp=0;return g;}
for(const [index,id]of ids.entries())test(id+' giant HP, attack and actual skills grow by 20% per campaign',()=>{
 const g=make(id),factor=1+index*.2,m=g.spawnMantisEncounter(),b=g.spawnBrainEncounter(),h=g.spawnMailMonster(915000);
 for(const [e,hp,damage]of [[m,560000,1000],[b,560000,650],[h,180000,650]]){assert.equal(e.maxHp,hp*factor);assert.equal(e.hp,e.maxHp);assert.equal(e.damage,damage*factor);}
 const hits=[];g.hurt=(target,damage)=>hits.push({target,damage});
 b.hidden=false;b.phase='attack';b.phaseAt=g.time;b.brainSkillAt=Infinity;b.nextBurrowAt=Infinity;b.strikeAt=g.time;
 g.updateCampaignEnemy(b,g.refinery,.1);assert(hits.some(v=>v.target===g.refinery&&v.damage===650*factor));
 g.castBrainSkill(b);const acid=g.fx.find(f=>f.owner===b&&f.damage===1000*factor);assert(acid);acid.age=0;g.updateZergBossHazard(acid);assert(hits.some(v=>v.damage===1000*factor));
 g.castBrainSkill(b);assert(g.fx.filter(f=>f.giantBrainSpike).every(f=>f.damage===1100*factor));
 const range=id==='zerg'?.5:1;m.hidden=false;m.phase='spray';m.phaseAt=g.time-1;m.animAge=.44;m.lavaTarget={...g.refinery};
 const impact=M.targetAt(m,0);Object.assign(g.player,impact,{hp:10000,respawn:0});hits.length=0;
 g.updateCampaignEnemy(m,g.refinery,.5);assert(hits.some(v=>v.target===g.player&&v.damage===500*factor*range));
 const pool=g.mantisLava.at(-1);assert.equal(pool.halfWidth,160*range);assert.equal(pool.radius,90*range);
 Object.assign(g.player,{x:pool.x,y:pool.y+pool.radius-1});hits.length=0;g.updateAirshipGround(.5);assert(hits.some(v=>v.target===g.player&&v.damage===160*factor*range));
 g.player.y=pool.y+pool.radius+1;hits.length=0;g.updateAirshipGround(.5);assert(!hits.some(v=>v.target===g.player));
 g.launchHiveSwarm(h,g.refinery);assert(h.swarm.every(d=>d.damage===180*factor));const d=h.swarm[0];d.launchAt=0;g.startHiveFlight(d);d.flightDistance=d.flightCurve.length;hits.length=0;g.updateHiveDrone(d,.01);assert(hits.some(v=>v.target===g.refinery&&v.damage===180*factor));
});
