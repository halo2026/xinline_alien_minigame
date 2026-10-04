const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared'])test(root+' operator portrait enters once and completes while combat is paused',()=>{
 const {View}=require(root+'/view'),v=new View({}, {},390,844),g=v.game;g.start();g.progress.battleIntroStep=3;
 const t={id:12200,x:760,y:970,techRank:0,techBranch:null,techSpec:null,cd:0};g.towers.push(t);g.gold=1000;
 assert(g.upgradePlacedTower(t,0,-1));assert.equal(t.operatorArrival.key,'12200:0');assert.equal(g.gold,900);assert(!g.fx.some(f=>f.kind==='tacticfx/3196'));
 v.selectedTower=t;const time=g.time;for(let i=0;i<6;i++)v.step(.05);assert(t.operatorArrival);v.step(.05);assert.equal(g.time,time);assert.equal(t.operatorArrival,undefined);
 g.progress.towerPaths[12200][0][0]=1;assert(g.upgradePlacedTower(t,0,0));assert.equal(t.operatorArrival,undefined);
});

for(const root of ['../shared','../../alien-wolf-wechat/shared'])test(root+' reopening upgrade options accelerates the remaining arrival without affecting another tower',()=>{const {View}=require(root+'/view'),v=new View({}, {},390,844),g=v.game;g.start();const t={id:12200,x:760,y:970,techRank:1,techBranch:0,techSpec:-1,cd:0,operatorArrival:{key:'12200:0',age:0}},other={...t,x:800,operatorArrival:{key:'12200:0',age:0}};g.towers.push(t,other);for(let i=0;i<4;i++)v.advanceOperatorArrivals(.1);assert.equal(t.operatorArrival.age,.4);v.selectedTower=t;v.advanceOperatorArrivals(.1);assert(Math.abs(t.operatorArrival.age-.7)<1e-8);v.advanceOperatorArrivals(.1);assert.equal(t.operatorArrival,undefined);assert(other.operatorArrival);v.selectedTower=null;for(let i=0;i<5;i++)v.advanceOperatorArrivals(.1);assert.equal(other.operatorArrival,undefined);});
