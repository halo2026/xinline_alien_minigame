const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared'])test(root+' cleanup retracts old towers once and leaves collectible crystals',()=>{
 const {Game}=require(root+'/core'),g=new Game();g.start();g.pending=[];g.enemies=[];g.state='settlement';g.wave=8;
 g.towers=[{id:12200,x:200,y:200},{id:12205,x:300,y:200}];const gold=g.gold;
 assert(g.beginCleanup());assert.equal(g.towers.length,0);assert.equal(g.retractingTowers.length,2);assert.equal(g.beginCleanup(),false);assert.equal(g.beginSecondAct(),false);
 g.time=.5;g.updateTowerRetraction();assert.equal(g.pickups.filter(p=>p.towerSalvage).length,0);
 g.time=2;g.updateTowerRetraction();const drops=g.pickups.filter(p=>p.towerSalvage);assert.equal(drops.length,2);assert.equal(g.retractingTowers.length,0);assert.equal(g.gold,gold);
 g.updateTowerRetraction();assert.equal(g.pickups.filter(p=>p.towerSalvage).length,2);
 let sum=0;for(const p of drops){assert(p.crystals>=100&&p.crystals<=300);sum+=p.crystals;assert(g.take(p));}assert.equal(g.gold,gold+sum);
});
