const test=require('node:test'),assert=require('node:assert/strict'),Escort=require('../shared/zerg1');
test('escort brain appears and resurfaces right of the convoy road and attacks live trucks',()=>{
 for(let seed=1;seed<=12;seed++){const g=new Escort.core.Game({seed});g.start();const e=g.spawnBrainEncounter();for(let k=0;k<4;k++){const q=k?g.brainResurfacePoint(e):e;assert(q.x>=1400&&q.y<2001);assert(!g.nav.blocked(q.x,q.y));Object.assign(e,{x:q.x,y:q.y});}}
 const g=new Escort.core.Game({seed:8});g.start();const e=g.spawnBrainEncounter(),truck={x:e.x-200,y:e.y,convoy:true,hp:20000,maxHp:20000,delivered:false};g.convoys=[truck];Object.assign(g.player,{x:200,y:200,shield:0});Object.assign(e,{phase:'attack',hidden:false,nextBurrowAt:Infinity,brainSkillAt:Infinity,cd:0});const hp=g.refinery.hp;g.updateCampaignEnemy(e,g.refinery,.01);assert.equal(e.strikeTarget,truck);g.time+=1;g.updateCampaignEnemy(e,g.refinery,.01);assert(truck.hp<20000);assert.equal(g.refinery.hp,hp);
 g.castBrainSkill(e);assert(g.fx.filter(f=>f.owner===e).every(f=>f.allowedTargets.includes(truck)&&!f.allowedTargets.includes(g.refinery)));
 truck.delivered=true;assert.equal(g.brainTarget(e),g.player);g.player.hp=0;assert.equal(g.brainTarget(e),null);g.updateCampaignEnemy(e,g.refinery,.1);assert.equal(g.refinery.hp,hp);
});
test('both chapters reduce spawned health and attack by exactly fifteen percent',()=>{
 for(const name of ['mine4','thunder-raid']){const S=require('../shared/'+name),g=new S.core.Game(),cmd=S.core.scheduleWave(0,0).find(c=>c.unit===12500);g.start();const e=g.spawn(cmd),d=S.data.unitTypes[12500];assert(Math.abs(e.maxHp-d.attr.hp*cmd.hpScale*.85)<1e-6);assert(Math.abs(e.damage-d.attr.attack[3]*cmd.attackScale*.85)<1e-6);}
});
test('the hidden cleanup entry cannot be activated from the old footer region',()=>{
 const M=require('../shared/mission-menu');let selected=null;const view={w:390,h:844,top:0,game:{progress:{}},bestiaryBookRect:()=>null},menu=new M.MissionMenu(view,id=>selected=id);menu.down(50,814);menu.up(50,814);assert.equal(selected,null);
});
