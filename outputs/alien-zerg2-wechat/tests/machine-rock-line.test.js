const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared']){
 const {Game}=require(root+'/core');
 function scene(){const g=new Game();g.start();g.pending=[];g.nextWave=Infinity;g.enemies=[];g.chests=[];g.towers=[];g.player.fireCd=999;g.yoda.hp=0;g.yoda.respawn=999;g.nav.cells=new Set(['40,40']);g.muzzle=from=>({x:from.x,y:from.y});return g;}
 test(root+' machine tower stops for rock-blocked ground enemy and switches to air',()=>{const g=scene(),t={id:12200,x:900,y:972,angle:0,techBranch:0,techRank:1,techSpec:0,cd:0,life:999,builtAt:-10};const e={id:12501,x:1080,y:972,hp:1e6,maxHp:1e6,scale:1,frozen:999,cd:999,skillCd:999,age:0};g.towers=[t];g.enemies=[e];assert(!g.machineLineClear(t,e));g.update(.01);assert(!g.bullets.some(b=>b.kind==='bullet'));const air={...e,air:true,x:1120};g.enemies.push(air);assert(g.machineLineClear(t,air));g.update(.01);const b=g.bullets.find(b=>b.kind==='bullet');assert(b);assert.equal(b.airTarget,true);g.nav.blocked=()=>true;g.update(.01);assert(g.bullets.includes(b));g.enemies=[e];g.nav.cells.clear();g.nav.blocked=()=>false;t.cd=0;g.update(.01);assert(g.bullets.some(b=>b.kind==='bullet'&&!b.airTarget));});
}
