const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared']){
 const {Game}=require(root+'/core');
 function setup(){const g=new Game(),e={id:12501,x:1050,y:900,hp:10000,maxHp:10000,scale:.6},t={id:12202,x:900,y:900,angle:0,techBranch:1,techRank:1,techSpec:0};g.enemies=[e];g.fire(t,'frost',{target:e});return {g,e,b:g.bullets[0]};}
 test(root+' ice crystal tracks only its locked moving target and applies ice status once',()=>{const {g,e,b}=setup(),other={...e,x:940};g.enemies.unshift(other);g.nav.blocked=()=>true;assert.equal(b.target,e);assert.equal(b.life,Infinity);assert.equal(g.trails.length,0);for(let i=0;i<300&&b.life;i++){e.y+=i<8?12:-4;e.x+=2;g.updateHomingEnergy(b,.016);}assert.equal(e.hp,10000-b.damage);assert.equal(other.hp,10000);assert.equal(b.hit.size,1);assert(e.slow>=.5);assert.equal(e.frostUntil,g.time+b.slowDuration);g.updateHomingEnergy(b,.016);assert.equal(e.hp,10000-b.damage);});
 test(root+' frost cancels when target dies or burrows without switching targets',()=>{for(const hidden of [false,true]){const {g,e,b}=setup(),other={...e};g.enemies.push(other);if(hidden)e.hidden=true;else e.hp=0;g.updateHomingEnergy(b,.1);assert.equal(b.life,0);assert.equal(other.hp,10000);assert.equal(e.frostUntil,undefined);}});
 test(root+' vehicle frost homing retains equipment freeze stacking',()=>{const {g,e,b}=setup();b.playerFrost=true;b.freezeBonus=.2;e.equipmentFrostStacks=9;g.updateHomingEnergy(b,1);assert.equal(e.equipmentFrostStacks,0);assert.equal(e.frozen,.5);});
}
