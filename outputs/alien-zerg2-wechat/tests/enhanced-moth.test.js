const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../shared/core'),A=require('../shared/art-data'),M=require('../shared/mail-monsters'),B=require('../shared/bestiary'),O=require('../shared/campaign-order'),Menu=require('../shared/mission-menu'),{View}=require('../shared/view');
const factory=require('../shared/defense-campaign'),art=require('../shared/defense-art');
function stage(id){return ['mine4','zerg1','greenstar','iron-alien'].includes(id)?require('../shared/'+id):id==='thunderraid'?require('../shared/thunder-raid'):id==='zerg'?{core:C}:factory.create(require('../shared/'+id+'-data'),art);}
test('every stage, next-stage navigation and giant strength use the starmap order',()=>{
 assert.deepEqual(O.ids,Menu.missions.map(m=>m.id));
 for(const [i,id] of O.ids.entries()){
  const g=new (stage(id).core.Game)({seed:42});g.start();
  for(const spawn of ['spawnMantisEncounter','spawnBrainEncounter']){const e=g[spawn]();assert(Math.abs(e.giantAttackScale-(1+i*.2))<1e-9,id);}
  const next=View.prototype.nextCampaign.call({game:g});assert.equal(next?.id,O.ids[i+1]);
 }
});
test('blue-carrier waves and archive are entirely replaced; independent moths include elites',()=>{
 for(const id of O.ids){const S=stage(id),g=new S.core.Game({seed:42});g.start();for(let wave=0;wave<g.totalWaves;wave++)assert(!S.core.scheduleWave(wave,0).some(c=>c.unit===11693),id);if(id==='airship3')assert(S.data.waves.flat().some(c=>c.unit===M.ENHANCED));}
 const S=stage('airship3'),g=new S.core.Game({seed:42});g.start();let normal=0,elite=0;
 for(let i=0;i<45;i++){g.time=i*7;const e=g.spawn({unit:M.ENHANCED,spawn:g.largeEncounterSpawnId,path:1});assert(e.air);assert(!e.hiveDrone);if(e.elite){elite++;assert(e.maxHp>=16000*4);assert.equal(e.eliteSkill,'acid');}else normal++;e.hp=0;}
 assert(normal&&elite);assert(!B.entries.some(e=>e.family==='UNIT_BLUE_CARRIER'));
});
test('only nightmare hive summons enhanced moths, with reduced damage and no random elite upgrade',()=>{
 for(let level=0;level<4;level++){const g=new C.Game({seed:42});g.start();g.challengeLevel=level;const h=g.spawnMailMonster(M.HIVE);g.launchHiveSwarm(h,g.refinery);assert.equal(h.swarm.length,6);for(const d of h.swarm){assert.equal(d.id,level===3?M.ENHANCED:M.DRONE);assert.equal(d.damage,level===3?216:180);assert(!d.elite);assert(d.hiveDrone);}
 h.hp=0;g.kill(h);assert(h.swarm.every(d=>!d.hiveDrone&&!d.hidden));}
});
test('enhanced moth keeps both frames in all 17 directions and interpolates glow slowly',()=>{
 const group=A.groups[M.ENHANCED];for(const rows of Object.values(group.anim))for(let d=1;d<=17;d++){assert.equal(rows[d].length,2);assert(rows[d].every(k=>A.frames[k]));}
 const v=new View({}, {pages:[]},420,900);const calls=[];v.sprite=(...args)=>calls.push(args);
 for(let i=0;i<32;i++){v.game.time=1.2;calls.length=0;v.anim(M.ENHANCED,'walk',0,0,.8,Math.PI/2-i*Math.PI/16,0);assert.equal(calls.length,2);assert.equal(calls[1][6],1);assert.equal(calls[0][0],`enhanced-moth/${i<=16?i+1:33-i}/1`);}
 for(const [t,alpha] of [[0,0],[.6,.5],[1.2,1],[2.4,0]]){v.game.time=t;calls.length=0;v.anim(M.ENHANCED,'walk',0,0,.8,0,0);assert(Math.abs(calls[1][6]-alpha)<1e-9);}
});
test('independent moth advances and fires damaging projectiles with its source for elite mitigation',()=>{
 const g=new C.Game();g.start();const e=g.spawn({unit:M.ENHANCED,spawn:g.largeEncounterSpawnId,path:1});g.mailTargets=()=>[g.refinery];Object.assign(e,{x:g.refinery.x+200,y:g.refinery.y,skillCd:0});const n=g.bullets.length;g.updateCampaignEnemy(e,g.refinery,.1);assert.equal(g.bullets.length,n+1);assert.equal(g.bullets.at(-1).sourceEnemy,e);assert.equal(g.bullets.at(-1).kind,'enemyacid');assert(g.bullets.at(-1).poisonBead);assert.equal(g.bullets.at(-1).damage,e.damage);assert.equal(require('../shared/level-data').unitTypes[M.ENHANCED].attr.move_speed,105);assert.equal(require('../shared/level-data').unitTypes[M.ENHANCED].attr.attack[3],216);assert.equal(e.skillCd,2.4);
});
test('nightmare hive moth travels thirty percent slower and spits once before returning without contact damage',()=>{const g=new C.Game({seed:42});g.start();g.challengeLevel=3;const h=g.spawnMailMonster(M.HIVE);g.launchHiveSwarm(h,g.refinery);const e=h.swarm[0];e.launchAt=0;g.time=1;g.updateHiveDrone(e,.1);assert(Math.abs(e.flightDistance-16.1)<1e-8);g.hurt=()=>{throw Error('contact attack must not bypass poison projectile');};const before=g.bullets.length;for(let i=0;i<500&&!e.flightHit;i++){g.time+=.05;g.updateHiveDrone(e,.05);}assert(e.flightHit);assert.equal(g.bullets.length,before+1);assert(g.bullets.at(-1).poisonBead);for(let i=0;i<200&&e.phase!=='return';i++){g.time+=.05;g.updateHiveDrone(e,.05);}assert.equal(e.phase,'return');assert.equal(g.bullets.length,before+1);});
