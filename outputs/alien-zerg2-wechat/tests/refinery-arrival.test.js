const test=require('node:test'),assert=require('node:assert/strict');
const {View}=require('../shared/view');
test('refinery lands before miners exit; battle clock and waves remain frozen throughout insertion',()=>{
 const v=new View({}, {},390,844),g=v.game;g.progress.battleIntroStep=3;g.start();const wave=g.wave,pending=g.pending.map(x=>x.time);v.step(.05);assert(g.miners.length>0);const m=g.miners[0],y=m.y;assert.equal(y,g.miningDock.y-64);for(let i=0;i<59;i++)v.step(.05);assert.equal(m.y,y);assert(v.refineryArrival().fall===0);assert.equal(g.time,0);assert.equal(g.wave,wave);assert.deepEqual(g.pending.map(x=>x.time),pending);
 for(let i=0;i<29;i++)v.step(.05);assert(m.y>g.miningDock.y);assert.equal(g.time,0);assert.equal(g.miners.length,1);for(let i=0;i<4;i++)v.step(.05);assert.equal(v.insertion,null);assert(g.time>0);assert.equal(g.miners.length,1);
});
test('paused opening stays still; retry gets one fresh opening',()=>{const v=new View({}, {},844,390);v.game.start();v.step(.05);v.paused=true;const t=v.insertion.age;v.step(.05);assert.equal(v.insertion.age,t);v.paused=false;v.game=v.game.retry();v.step(.05);assert.equal(v.insertion.age,.05);assert.equal(v.game.miners.length,1);});
