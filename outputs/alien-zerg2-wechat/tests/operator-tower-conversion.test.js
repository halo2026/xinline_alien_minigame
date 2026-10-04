const test=require('node:test'),assert=require('node:assert/strict');
for(const campaign of ['alien-zerg2-wechat','alien-wolf-wechat'])test(campaign+': operator unlock converts base tower without granting research',()=>{
 const {Game}=require('../../'+campaign+'/shared/core'),g=new Game(),t={id:12200,x:900,y:1000,techRank:0};g.state='playing';g.towers=[t];g.gold=10000;
 assert.equal(g.upgradePlacedTower(t,2,-1),false);g.progress.operators['12200:2']=true;
 const cost=g.towerUpgradeOptions(t).find(o=>o.branch===2).cost,before=g.gold;
 assert.equal(g.upgradePlacedTower(t,2,-1),true);assert.equal(g.gold,before-cost);assert.deepEqual(g.placedTowerRanks(t),[0,0]);assert.equal(g.towerStats(t).mode,'sniper');assert.equal(g.towerStats(t).damage,2.4);assert.equal(g.towerUpgradeOptions(t).some(o=>o.available),false);
 g.progress.towerPaths[12200][2]=[1,1];assert.equal(g.towerUpgradeOptions(t).filter(o=>o.available).length,2);assert.equal(g.upgradePlacedTower(t,2,0),true);assert.deepEqual(g.placedTowerRanks(t),[1,0]);assert.equal(g.upgradePlacedTower(t,2,1),true);assert.deepEqual(g.placedTowerRanks(t),[1,1]);assert.equal(g.upgradePlacedTower(t,0,-1),false);
 const poor={id:12200,techRank:0};g.towers.push(poor);g.gold=0;assert.equal(g.upgradePlacedTower(poor,2,-1),false);
});
