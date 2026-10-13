const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared']){
 const P=require(root+'/progression'),{Game}=require(root+'/core'),{View}=require(root+'/view');
 test(root+' rolls keep 4:2:1 odds but cap awards at one above current stars',()=>{
  const s=P.fresh(),counts=[0,0,0,0];for(let i=0;i<700;i++)counts[P.rollOperatorStar(s,'12200:0',()=> (i+.5)/700)]++;
  assert.deepEqual(counts,[0,400,300,0]);P.grantOperator(s,'12200:0',2);counts.fill(0);for(let i=0;i<700;i++)counts[P.rollOperatorStar(s,'12200:0',()=> (i+.5)/700)]++;assert.deepEqual(counts,[0,400,200,100]);assert.equal(P.rollOperatorStar(s,'12202:0',()=>.99),1);
 });
 test(root+' upgrade replaces all owned branches, never downgrades or unlocks siblings, saves stars',()=>{
  const s=P.fresh();s.operators['12200:1']=true;assert(P.grantOperator(s,'12200:0',3));assert.equal(P.operatorStar(s,'12200:0'),2);assert(P.grantOperator(s,'12200:0',3));assert.equal(P.operatorStar(s,'12200:1'),3);assert(!s.operators['12200:2']);assert(!P.grantOperator(s,'12200:0',1));
  const restored=P.restore(JSON.parse(JSON.stringify(s)));assert.equal(P.operatorStar(restored,'12200:1'),3);assert.equal(P.operatorStar(P.restore(P.fresh()),'12200:0'),1);
 });
 test(root+' 2/3 stars provide 10/20 percent damage range and fire rate, basic towers unchanged',()=>{
  const g=new Game(),s=g.progress,t={id:12200,techBranch:0,techRank:1,techSpec:0};const base=g.towerStats(t),plain=g.towerStats({id:12200,techBranch:null,techRank:0});
  for(const stars of [2,3]){P.grantOperator(s,'12200:0',stars);const a=g.towerStats(t),mult=1+(stars-1)*.1;assert(Math.abs(a.damage/base.damage-mult)<1e-9);assert(Math.abs(a.range/base.range-mult)<1e-9);assert(Math.abs(base.interval/a.interval-mult)<1e-9);assert.deepEqual(g.towerStats({id:12200,techBranch:null,techRank:0}),plain);assert.deepEqual(g.towerStats(t),a);}
 });
 test(root+' actual chest upgrades and persists reveal star metadata',()=>{
  const g=new Game();g.progress.inventory.push({id:P.CHEST_ID,uid:g.progress.nextUid++,count:1});let n=0;g.random=()=>[0,.01,0,.99][n++]??0;
  const result=g.openChests(1),r=result.rewards.find(r=>r.kind==='operator');assert.equal(r.stars,2);assert.equal(P.operatorStar(g.progress,'12200:0'),2);const s=P.restore(g.saveProgress());assert.equal(s.pendingChestRewards.rewards.find(r=>r.kind==='operator').stars,2);assert(View.prototype.chestRewardDetails(r).title.startsWith('2星'));
 });
}
test('portrait renderer selects exact star row and character column, with original fallback',()=>{
 const {View}=require('../shared/view'),P=require('../shared/progression'),calls=[];
 const ctx={drawImage:(...a)=>calls.push(a),save(){},restore(){},fillRect(){}};
 const portraits={width:3300},operatorStars={width:3300};
 const v={ctx,images:{portraits,operatorStars},game:{progress:P.fresh()},text(){},techPlate(){},sprite(){}};
 View.prototype.operatorPortrait.call(v,'12205:2',0,0,180,180,false,3);
 assert.equal(calls[0][0],operatorStars);assert.equal(calls[0][1],(8*240+24)*1.25);assert.equal(calls[0][2],(388+83.42)*1.25+30);assert.equal(calls[0][4],186.24*1.25);assert(Math.abs(calls[0][6]-2.7)<1e-9);assert(Math.abs(calls[0][8]-174.6)<1e-9);
 View.prototype.operatorPortrait.call(v,'12200:0',0,0,180,180,false,1);assert.equal(calls[1][0],portraits);
});
test('direct grants cannot skip any prerequisite star and existing high stars are retained',()=>{for(const root of ['../shared','../../alien-wolf-wechat/shared']){const P=require(root+'/progression'),s=P.fresh(),key='12202:0';for(const expected of [1,2,3]){P.grantOperator(s,key,3);assert.equal(P.operatorStar(s,key),expected);}assert.equal(P.operatorStar(P.restore(s),key),3);P.grantOperator(s,key,1);assert.equal(P.operatorStar(s,key),3);}});
