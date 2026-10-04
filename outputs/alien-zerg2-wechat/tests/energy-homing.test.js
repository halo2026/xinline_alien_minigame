const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared']){
 const {Game}=require(root+'/core');
 function setup(){const g=new Game(),t={id:12202,x:900,y:900,angle:0,techRank:0},e={id:12501,x:1050,y:900,hp:2000,maxHp:2000,scale:.6};g.enemies=[e];g.fire(t,'energy',{target:e});return {g,t,e,b:g.bullets[0]};}
 test(root+' energy tracks a turning target beyond original range, hits once and has no trail',()=>{const {g,e,b}=setup();assert.equal(b.target,e);assert.equal(b.speed,420);assert.equal(b.life,Infinity);for(let i=0;i<200&&b.life;i++){e.y+=i<30?7:-3;e.x+=3;g.updateHomingEnergy(b,.025);}assert.equal(e.hp,1700);assert.equal(b.hit.size,1);assert.equal(b.life,0);assert.equal(g.trails.length,0);});
 test(root+' locked energy ignores intervening enemy and ground obstacles',()=>{const {g,e,b}=setup(),other={...e,x:950};g.enemies.unshift(other);g.nav.blocked=()=>true;for(let i=0;i<100&&b.life;i++)g.updateHomingEnergy(b,.02);assert.equal(e.hp,1700);assert.equal(other.hp,2000);});
 test(root+' target death or burrowing cancels the projectile without retargeting',()=>{for(const hidden of [false,true]){const {g,e,b}=setup();if(hidden)e.hidden=true;else e.hp=0;const other={...e,hp:2000,hidden:false};g.enemies.push(other);g.updateHomingEnergy(b,.1);assert.equal(b.life,0);assert.equal(other.hp,2000);assert.equal(e.hp,hidden?2000:0);}});
}
