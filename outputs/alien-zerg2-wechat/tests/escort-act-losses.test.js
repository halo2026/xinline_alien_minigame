const test=require('node:test'),assert=require('node:assert/strict');
const {core:C}=require('../shared/zerg1');
const truckEvent=C.scheduleWave(0,0).find(e=>e.convoy);
function loseTruck(g){const c=g.spawnConvoy(truckEvent);g.hurt(c,c.hp);}
function completeFirstAct(g){g.wave=g.firstWaves;g.enemies=[];g.pending=[];g.nextWave=Infinity;g.update(.01);assert.equal(g.state,'settlement');}
test('escort losses restart at zero in act II and its retry, with three new losses required to fail',()=>{
 const g=new C.Game();g.start();loseTruck(g);loseTruck(g);assert.equal(g.convoyLost,2);
 completeFirstAct(g);assert.equal(g.convoyLost,2);assert.equal(g.saveProgress().campaignActs.zerg1.convoyLost,0);
 assert(g.beginCleanup());assert(g.beginSecondAct());assert.equal(g.convoyLost,0);
 loseTruck(g);assert.equal(g.convoyLost,1);assert.equal(g.state,'playing');
 loseTruck(g);assert.equal(g.convoyLost,2);assert.equal(g.state,'playing');
 loseTruck(g);assert.equal(g.convoyLost,3);assert.equal(g.state,'lost');
 const retry=g.retry();assert.equal(retry.wave,retry.firstWaves+1);assert.equal(retry.convoyLost,0);
});
test('resuming old act II checkpoints also starts with zero convoy losses',()=>{
 const g=new C.Game();g.start();loseTruck(g);completeFirstAct(g);
 const progress=g.saveProgress();progress.campaignActs.zerg1.convoyLost=2;
 const resumed=new C.Game({progress});resumed.start();assert.equal(resumed.wave,resumed.firstWaves+1);assert.equal(resumed.convoyLost,0);
});
