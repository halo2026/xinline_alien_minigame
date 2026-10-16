const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared']){
 test(root+' batches researched ranks after operator arrival without changing total cost',()=>{
  const {Game}=require(root+'/core'),g=new Game();g.start();g.gold=10000;
  const t={id:12200,techRank:0};g.towers=[t];g.progress.operators['12200:0']=true;g.progress.towerPaths[12200][0]=[3,2];
  assert(g.upgradePlacedTower(t,0,-1));assert.equal(g.gold,9900);assert.deepEqual(t.techRanks,[0,0]);
  const o=g.towerUpgradeOptions(t).find(o=>o.branch===0&&o.spec===0);assert.equal(o.cost,650);assert.equal(o.targetRank,3);
  assert(g.upgradePlacedTower(t,0,0));assert.deepEqual(t.techRanks,[3,0]);assert.equal(g.gold,9250);
  assert(g.upgradePlacedTower(t,0,1));assert.deepEqual(t.techRanks,[3,2]);assert.equal(g.gold,8950);
  assert.equal(g.upgradePlacedTower(t,0,1),false);assert.equal(g.gold,8950);
  g.progress.towerPaths[12200][0][0]=5;g.gold=1249;assert.equal(g.upgradePlacedTower(t,0,0),false);assert.equal(g.gold,1249);assert.deepEqual(t.techRanks,[3,2]);
  g.gold=1250;assert(g.upgradePlacedTower(t,0,0));assert.equal(g.gold,0);assert.deepEqual(t.techRanks,[5,2]);
 });
}
