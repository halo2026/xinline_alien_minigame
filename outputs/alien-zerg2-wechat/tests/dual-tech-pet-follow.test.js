const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared']){
 test(root+' placed tower independently grows both researched directions',()=>{
  const {Game}=require(root+'/core'),g=new Game();g.start();g.gold=100000;
  g.progress.towerPaths[12200][0]=[2,2];const t={id:12200,x:200,y:200,techRank:0};g.towers=[t];
  assert(g.upgradePlacedTower(t,0,0));assert(g.upgradePlacedTower(t,0,1));assert.deepEqual(t.techRanks,[1,1]);
  const stats=g.towerStats(t);assert.equal(stats.damage,1.25);assert(stats.range>400);
  assert.equal(g.towerUpgradeOptions(t).filter(o=>o.available).length,2);
  assert(g.upgradePlacedTower(t,0,0));assert.equal(g.towerUpgradeOptions(t).filter(o=>o.available).length,1);
  assert(g.upgradePlacedTower(t,0,1));assert.equal(g.towerUpgradeOptions(t).filter(o=>o.available).length,0);
  const gold=g.gold;assert.equal(g.upgradePlacedTower(t,0,1),false);assert.equal(g.gold,gold);
  g.progress.towerPaths[12200][0][0]=3;assert(g.upgradePlacedTower(t,0,0));assert.deepEqual(t.techRanks,[3,2]);
  const old={id:12200,x:200,y:200,techBranch:0,techSpec:1,techRank:2};g.towers=[old];assert(g.upgradePlacedTower(old,0,0));assert.deepEqual(old.techRanks,[1,2]);
 });
 test(root+' pet returns to owner and refuses distant targets',()=>{
  const {Game}=require(root+'/core'),g=new Game();g.start();g.nav={clear:()=>true,blocked:()=>false};
  Object.assign(g.player,{x:1000,y:1000,vx:0,vy:0});Object.assign(g.yoda,{x:1400,y:1000,attackAge:.1,strike:{x:1400,y:1000}});
  const enemy={x:1450,y:1000,hp:10000,air:false};g.enemies=[enemy];g.yoda.target=enemy;
  g.updateYoda(.1);assert(g.yoda.x<1400);assert.equal(g.yoda.target,null);assert.equal(g.yoda.attackAge,null);
  for(let i=0;i<80;i++)g.updateYoda(.1);
  assert(Math.hypot(g.yoda.x-1000,g.yoda.y-1000)<=103);assert.equal(g.yoda.target,undefined);assert.equal(enemy.hp,10000);
  const near={x:1150,y:1000,hp:1000,air:false};g.enemies=[near];g.updateYoda(.1);assert.equal(g.yoda.target,near);
  g.enemies=[];g.yoda.target=null;g.yoda.attackAge=null;Object.assign(g.player,{x:1100,y:1200});const before=Math.hypot(g.yoda.x-1100,g.yoda.y-1200);g.updateYoda(.1);assert(Math.hypot(g.yoda.x-1100,g.yoda.y-1200)<before);
 });
}
for(const root of ['../shared'])test(root+' following eases in/out and does not chatter near resting distance',()=>{
 const {Game}=require(root+'/core'),g=new Game();g.start();g.nav={clear:()=>true,blocked:()=>false};g.enemies=[];
 Object.assign(g.player,{x:1000,y:1000,vx:0,vy:0});Object.assign(g.yoda,{x:1160,y:1000,attackAge:null});
 g.updateYoda(1/60);const first=1160-g.yoda.x;g.updateYoda(1/60);assert(1160-g.yoda.x-first>first);
 for(let i=0;i<300;i++)g.updateYoda(1/60);
 const rest=g.yoda.x;assert(rest>=1100&&rest<=1103);assert.equal(g.yoda.action,'stand');
 for(let i=0;i<120;i++){g.player.x=1000+(i%2?5:-5);g.updateYoda(1/60);}assert.equal(g.yoda.x,rest);assert.equal(g.yoda.action,'stand');
 g.player.x=950;g.updateYoda(1/60);assert(g.yoda.x<rest);assert.equal(g.yoda.action,'walk');
});
