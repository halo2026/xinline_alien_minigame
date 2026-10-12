const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared']){
 const P=require(root+'/progression'),S=require(root+'/store'),{View}=require(root+'/view');
 test(root+' supply station appears only after both Zerg acts and survives replay/save',()=>{
  const v=new View({}, {},390,844),s=v.game.progress;
  const visible=()=>v.managementTabs().some(t=>t.page==='store');
  assert.equal(visible(),false);v.switchManagement('store');assert(!v.storeOpen);
  P.grantActReward(s,'zerg1',1);P.grantActReward(s,'zerg1',2);assert.equal(visible(),false);
  P.grantActReward(s,'zerg',1);s.campaignActs={zerg:{act:2}};
  assert.equal(visible(),false);v.switchManagement('store');assert(!v.storeOpen);
  P.grantActReward(s,'zerg',2);assert.equal(visible(),true);
  v.switchManagement('store');assert.equal(v.storeOpen,true);v.closeManagement();
  s.campaignActs.zerg.act=1;v.game.progress=P.restore(JSON.stringify(s));
  assert.equal(visible(),true);v.switchManagement('store');assert.equal(v.storeOpen,true);
 });
 test(root+' legacy completed saves unlock and navigation remains centered',()=>{
  const s=P.fresh();delete s.actFirstClearRewards;s.campaignActs={zerg:{act:3}};
  const restored=P.restore(JSON.stringify(s));assert(S.unlocked(restored));
  restored.campaignActs.zerg.act=1;assert(S.unlocked(P.restore(JSON.stringify(restored))));
  for(const w of [320,390,844])for(const complete of [false,true]){
   const v=new View({}, {},w,844);if(complete)v.game.progress=restored;
   const tabs=v.managementTabs();assert.equal(tabs.length,complete?3:2);
   assert(Math.abs(tabs[0].x-(w-tabs.at(-1).x-tabs.at(-1).w))<1e-8);
   assert(tabs.every(t=>t.x>=0&&t.x+t.w<=w));
  }
 });
}
