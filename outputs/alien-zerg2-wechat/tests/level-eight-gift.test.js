const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared']){
 const {View}=require(root+'/view'),{Game}=require(root+'/core');
 test(root+' level eight gift grants rocket, and never repeats',()=>{
  for(const [rocket,ice,expected]of [[false,false,'12205:2'],[true,false,null],[true,true,null]]){
   const g=new Game();g.progress.level=7;g.progress.operators['12205:2']=rocket;g.progress.operators['12202:1']=ice;assert(!g.claimLevelEightGift());assert(!g.progress.levelEightGiftClaimed);g.progress.level=8;assert.equal(g.claimLevelEightGift(),!!expected);assert.equal(g.progress.pendingLevelEightGift,expected);if(expected)assert(g.progress.operators[expected]);const next=new Game({progress:g.saveProgress()});assert(next.progress.levelEightGiftClaimed);assert.equal(next.progress.pendingLevelEightGift,expected);assert(!next.claimLevelEightGift());
  }
 });
 test(root+' delayed first technology visit queues both gifts, restores, pauses and dismisses separately',()=>{
  const v=new View({}, {pages:[]},390,844);v.game.progress.level=9;v.switchManagement('vehicle');assert(!v.game.progress.levelEightGiftClaimed);v.switchManagement('technology');assert.equal(v.pendingTechnologyGiftKey(),'12202:1');assert.equal(v.game.progress.pendingLevelEightGift,'12205:2');v.operatorRevealAge=1;v.down(1,100,100);assert.equal(v.pendingTechnologyGiftKey(),'12205:2');v.game=new Game({progress:v.game.saveProgress()});let ticks=0;v.game.update=()=>ticks++;v.step(.1);assert.equal(ticks,0);v.operatorRevealAge=1;v.down(1,100,100);assert(!v.pendingTechnologyGiftKey());assert.equal(v.techTower,12205);assert.equal(v.techBranch,2);v.switchManagement('technology');assert(!v.pendingTechnologyGiftKey());assert(v.game.progress.operators['12202:1']);
 });
}
