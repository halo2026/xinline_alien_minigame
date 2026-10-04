const test=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../shared/core'),A=require('../shared/art-data');
test('enemy fire expires into its six-frame native burst rather than generic flame',()=>{
 const g=new Game();g.enemyProjectileImpact({kind:'enemyfire',x:612,y:830});
 assert.deepEqual(g.fx.map(f=>[f.kind,f.x,f.y,f.life,f.scale]),[['enemyfirehit',612,830,.3,.8]]);
 assert.equal(A.groups.enemyfirehit.length,6);
 for(const n of A.groups.enemyfirehit){assert.equal(A.frames[n].w,64);assert.equal(A.frames[n].oy,-51.2);}
});
test('acid does not manufacture a cannon impact effect',()=>{const g=new Game();g.enemyProjectileImpact({kind:'enemyacid',x:1,y:2});assert.equal(g.fx.length,0);});
test('melee claws and sparks remain at the struck location, with attack direction',()=>{
 for(const id of [12500,12501,12503,12504])for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){
  const g=new Game(),target={x:300,y:700,hp:100};g.enemyMeleeImpact({id,angle},target);target.x=600;
  const f=g.fx[0],claw=id===12501||id===12503;
  assert.equal(f.x,300);assert.equal(f.y,700);assert.equal(f.kind,claw?'enemyclaw':'burst');assert.equal(f.life,claw?.48:.18);assert.equal(f.angle,claw?angle:angle+Math.PI/2);
 }
 assert.equal(A.groups.enemyclaw.length,3);
});
test('fire impact damages once and its visual expires without reapplying damage',()=>{
 const g=new Game();g.start();g.pending=[];g.nextWave=Infinity;g.yoda.hp=0;g.player.fireCd=100;
 const p=g.player;p.shield=0;g.bullets.push({kind:'enemyfire',sx:p.x,sy:p.y,x:p.x,y:p.y,tx:p.x,ty:p.y,age:0,life:.01,damage:200});
 const hp=p.hp;g.update(.02);assert.equal(p.hp,hp-200*100/(100+p.armor));assert.equal(g.fx.filter(f=>f.kind==='enemyfirehit').length,1);
 for(let i=0;i<8;i++)g.update(.05);assert.equal(p.hp,hp-200*100/(100+p.armor));assert.equal(g.fx.filter(f=>f.kind==='enemyfirehit').length,0);
});
