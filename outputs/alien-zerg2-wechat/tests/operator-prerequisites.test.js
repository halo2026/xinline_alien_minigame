const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared']){
 const P=require(root+'/progression'),{Game}=require(root+'/core'),{View}=require(root+'/view');
 test(root+' every operator requires its own prerequisite despite an owned high-star sibling',()=>{
  for(const key of P.operatorKeys)for(const owned of [0,1,2])for(const rolled of [2,3]){
   const s=P.fresh(),id=key.split(':')[0],sibling=P.operatorKeys.find(k=>k!==key&&k.startsWith(id+':'));
   s.operators=P.restoreOperators({[sibling]:true,...(owned?{[key]:true}:{})});
   s.operatorStars={[sibling]:3,...(owned?{[key]:owned}:{})};
   const expected=Math.min(rolled,owned+1);
   assert.equal(P.operatorStar(s,key),owned);
   assert.equal(P.rollOperatorStar(s,key,()=>rolled===2?.7:.99),expected);
   P.grantOperator(s,key,rolled);
   assert.equal(P.operatorStar(s,key),expected);
   assert.equal(P.operatorStar(s,sibling),3);
   assert.equal(P.operatorStar(P.restore(JSON.stringify(s)),key),expected);
  }
 });
 test(root+' real chest first gives one star next gives two then three with matching saved rewards',()=>{
  const key='12200:1',g=new Game();
  g.progress.operatorStars={12200:3}; // Old save: starter sibling owned, this operator absent.
  for(const expected of [1,2,3]){
   g.progress.pendingChestRewards=null;
   g.progress.inventory.push({id:P.CHEST_ID,uid:g.progress.nextUid++,count:1});
   const sequence=[0,.01,(P.operatorKeys.indexOf(key)+.5)/P.operatorKeys.length,.99];let n=0;
   g.random=()=>sequence[n++]??.99;
   const result=g.openChests(1),reward=result.rewards.find(r=>r.kind==='operator');
   assert.equal(reward.key,key);assert.equal(reward.stars,expected);
   assert.equal(P.operatorStar(g.progress,key),expected);
   assert.equal(P.operatorStar(g.progress,'12200:0'),3);
   const restored=P.restore(g.saveProgress());
   assert.equal(restored.pendingChestRewards.rewards.find(r=>r.kind==='operator').stars,expected);
   assert.equal(P.operatorStar(restored,key),expected);
   assert.equal(View.prototype.chestRewardDetails(reward).title,P.operatorName(key,expected));
   g.progress=restored;
  }
 });
 test(root+' legacy family stars migrate only for owned operators and remain stable',()=>{
  const old=P.fresh();old.operators['12200:1']=true;old.operatorStars={12200:3};
  const migrated=P.restore(old);
  assert.equal(P.operatorStar(migrated,'12200:0'),3);assert.equal(P.operatorStar(migrated,'12200:1'),3);
  assert.equal(P.operatorStar(migrated,'12200:2'),0);
  P.grantOperator(migrated,'12200:2',3);
  assert.equal(P.operatorStar(migrated,'12200:2'),1);
  assert.deepEqual(P.restore(migrated).operatorStars,migrated.operatorStars);
  P.grantOperator(migrated,'12200:0',1);assert.equal(P.operatorStar(migrated,'12200:0'),3);
 });
 test(root+' tower bonuses read the specific operator and do not inherit sibling stars',()=>{
  const g=new Game(),s=g.progress;s.operators['12200:1']=true;
  s.operatorStars={'12200:0':1,'12200:1':1};
  const tower=branch=>({id:12200,techBranch:branch,techRank:1,techSpec:0});
  const a=g.towerStats(tower(0)),b=g.towerStats(tower(1));
  P.grantOperator(s,'12200:0',3);P.grantOperator(s,'12200:0',3);
  assert(Math.abs(g.towerStats(tower(0)).damage/a.damage-1.2)<1e-9);
  assert.deepEqual(g.towerStats(tower(1)),b);
 });
}
