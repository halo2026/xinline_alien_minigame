const test=require('node:test'),assert=require('node:assert/strict'),raw=require('../shared/airship3-data'),art=require('../shared/defense-art'),campaign=require('../shared/defense-campaign'),M=require('../shared/mail-monsters');
test('both mothership acts reduce scheduled totals to 75% including scripted reinforcements, preserving bosses',()=>{
 const before=JSON.stringify(raw),s=campaign.create(raw,art);
 for(let i=0;i<14;i++){
  const round=i%7,extra=(M.airshipEncounters[round+1]||[]).length,old=raw.waves[round].reduce((n,e)=>n+e.count,0)+extra,batch=s.core.scheduleWave(i,0);
  assert.equal(batch.length+extra,Math.round(old*.75));
  for(const id of raw.campaignConfig.bossIds)assert.equal(batch.filter(e=>e.unit===id).length,raw.waves[round].filter(e=>e.unit===id).reduce((n,e)=>n+e.count,0));
 }
 assert.equal(JSON.stringify(raw),before);
 assert.deepEqual(campaign.create(raw,art).data.waves,s.data.waves);
});
test('mothership ordinary, boss and added monster HP scales by 25% on top of act scaling',()=>{
 const s=campaign.create(raw,art),g=new s.core.Game();g.start();
 for(const id of [11692,11691,M.HIVE,M.THUNDER,M.DRONE])for(const factor of [1,1.6]){
  const e=g.spawn({unit:id,spawn:3,path:1,hpScale:factor});
  assert.equal(e.maxHp,s.data.unitTypes[id].attr.hp*factor*1.25);assert.equal(e.hp,e.maxHp);
 }
});
