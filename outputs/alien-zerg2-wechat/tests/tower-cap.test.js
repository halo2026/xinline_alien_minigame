const test=require('node:test'),assert=require('node:assert/strict');
for(const name of ['alien-zerg2-wechat','alien-wolf-wechat']){const {Game}=require('../../'+name+'/shared/core');
 test(name+' allows repeated builds, caps active towers at 20 and releases capacity',()=>{
  const g=new Game();g.start();g.gold=100000;
  // Isolate the capacity contract from terrain, tested separately by roadside-build.
  g.nearestBuildSite=(x,y)=>({x,y});
  for(let i=0;i<20;i++){assert(g.buyTower(12200));assert(g.placeTower(i*100,500));}
  assert.equal(g.towers.length,20);assert.equal(g.buildStock,0);const gold=g.gold;
  assert.equal(g.buyTower(12200),false);g.buildSelected=12200;assert.equal(g.placeTower(999,999),false);assert.equal(g.gold,gold);assert.equal(g.towers.length,20);
  g.beginWave();assert.equal(g.buildStock,0);assert.equal(g.buyTower(12200),false);
  for(let i=0;i<25;i++){g.towers.pop();assert.equal(g.buildStock,1);assert(g.buyTower(12200));assert(g.placeTower(900,900));assert.equal(g.towers.length,20);}
  g.towers.pop();g.gold=0;assert.equal(g.buyTower(12200),false);assert.equal(g.buildStock,1);
 });
}
