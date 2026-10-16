const test=require('node:test'),assert=require('node:assert/strict'),factory=require('../shared/defense-campaign'),art=require('../shared/defense-art');
for(const [id,n]of [['zerg',10],['zerg1',7],['snake3',7],['fish3',8],['airship3',7],['fortress2',9],['scorpion2',9]]){
 const bundle=id==='zerg'?{core:require('../shared/core'),api:require('../shared/view')}:id==='zerg1'?require('../shared/zerg1'):factory.create(require('../shared/'+id+'-data'),art),{Game,scheduleWave}=bundle.core;
 test(id+' has exactly two standard acts, matching schedules, HUD, resume and victory',()=>{
  const g=new Game({seed:11});g.start();assert.equal(g.firstWaves,n);assert.equal(g.totalWaves,n*2);const label=()=>bundle.api.View.prototype.waveLabel.call({game:g});assert.equal(label(),`1/${n}`);
  for(let i=0;i<n*2;i++){const batch=scheduleWave(i,0);assert(batch.length>0,`empty wave ${i+1}`);if(id!=='zerg'&&i>=n){const before=scheduleWave(i-n,0);assert.deepEqual(batch.map(e=>[e.unit,e.spawn,e.convoy]),before.map(e=>[e.unit,e.spawn,e.convoy]));}}
  assert.deepEqual(scheduleWave(n*2,0),[]);assert.deepEqual(scheduleWave(n*3-1,0),[]);
  const clear=()=>{g.pending=[];g.enemies=[];g.convoys=[];g.nextWave=Infinity;g.victoryAt=0;g.update(.01);};
  for(let i=1;i<=n;i++){assert.equal(g.wave,i);clear();if(i<n){assert.equal(g.state,'playing');g.beginWave();}}
  assert.equal(g.state,'settlement');assert.equal(label(),`${n}/${n}`);g.beginCleanup();assert(g.beginSecondAct());assert.equal(g.wave,n+1);assert.equal(label(),`${n+1}/${n*2}`);
  const resumed=new Game({progress:g.saveProgress()});resumed.start();assert.equal(resumed.wave,n+1);assert.equal(resumed.totalWaves,n*2);assert.equal(resumed.retry().wave,n+1);assert.equal(resumed.retry(true).wave,1);
  g.initRunLoot();assert(g.runLoot.pending.every(r=>r.wave>=n+1&&r.wave<=n*2));
  for(let i=n+1;i<=n*2;i++){assert.equal(g.wave,i);clear();if(i<n*2){assert.equal(g.state,'playing');g.beginWave();}}
  assert.equal(g.state,'won');assert.equal(label(),`${n*2}/${n*2}`);assert(g.progress.campaignClears[id]);g.beginWave();assert.equal(g.wave,n*2);
 });
 test(id+' last-wave failure rewards use the corrected end of each act',()=>{for(const [wave,expected]of [[n-1,false],[n,true],[n*2-1,false],[n*2,true]]){const g=new Game({seed:9});g.wave=wave;g.peakDefenseTowers=10;g.kills=20;g.random=()=>0;const summary=g.failMission();assert.equal(summary.reachedLast,expected);assert.equal(summary.chests,expected?1:0);}});
}
test.skip('standalone wolf remains its configured twelve-wave campaign',()=>{const D=require('../../alien-wolf-wechat/shared/level-data'),{Game}=require('../../alien-wolf-wechat/shared/core');assert.equal(D.settings.totalWave,12);assert.equal(D.waves.length,12);const g=new Game();g.start();g.wave=12;g.pending=[];g.enemies=[];g.nextWave=Infinity;g.victoryAt=0;g.update(.01);assert.equal(g.state,'won');});
