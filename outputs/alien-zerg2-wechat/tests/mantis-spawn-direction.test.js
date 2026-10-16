const test=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../shared/core');
test('mantis prefers randomized north/northeast points without affecting other giants',()=>{
 const points=new Set();
 for(let seed=1;seed<=40;seed++){const g=new Game({seed});g.hasGround=()=>true;g.nav.blocked=()=>false;g.towers=[];const r=g.refinery,e=g.spawnMantisEncounter();assert(e.x>=r.x-1e-8&&e.y<r.y);const d=Math.hypot(e.x-r.x,e.y-r.y);assert(d>=360-1e-8&&d<=480+1e-8);points.add(e.x.toFixed(2)+','+e.y.toFixed(2));}
 assert(points.size>20);
});
test('mantis placement avoids towers and holes, and falls back if northern sector is unavailable',()=>{
 const g=new Game({seed:8}),r=g.refinery;g.hasGround=(x,y)=>y<r.y-100;g.nav.blocked=(x,y)=>x<r.x+80;g.towers=[{x:r.x+180,y:r.y-340,life:Infinity}];
 const q=g.mantisEncounterPoint();assert(g.hasGround(q.x,q.y));assert(!g.nav.blocked(q.x,q.y));assert(Math.hypot(q.x-g.towers[0].x,q.y-g.towers[0].y)>=45);
 g.hasGround=()=>false;const fallback={x:r.x-200,y:r.y};let calls=0;g.largeEncounterPoint=(...args)=>{calls++;assert.deepEqual(args,[360,480,90]);return fallback;};assert.deepEqual(g.mantisEncounterPoint(),fallback);assert.equal(calls,1);
});
test('actual maps keep mantis on navigable ground across seeds',()=>{
 const factory=require('../shared/defense-campaign'),art=require('../shared/defense-art');
 const stages=[{core:{Game}},...['mine4','zerg1','greenstar','thunder-raid','iron-alien'].map(id=>require('../shared/'+id)),...['snake3','airship3','fish3','fortress2','scorpion2'].map(id=>factory.create(require('../shared/'+id+'-data'),art))];
 for(const stage of stages)for(let seed=1;seed<=8;seed++){const g=new stage.core.Game({seed});g.start();const e=g.spawnMantisEncounter();assert(g.hasGround(e.x,e.y),g.campaignId);assert(!g.nav.blocked(e.x,e.y),g.campaignId);}
});
