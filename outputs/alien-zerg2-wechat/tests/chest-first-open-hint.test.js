const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared']){
 const {Game}=require(root+'/core'),{View}=require(root+'/view'),P=require(root+'/progression');
 const make=g=>Object.assign(Object.create(View.prototype),{game:g,inventoryOpen:true});
 test(root+' first-open hint starts at five and survives closing inventory and reloading',()=>{
  const g=new Game(),v=make(g);g.collectChest({count:4});assert(!v.chestFirstOpenHint());g.collectChest({count:1});assert(v.chestFirstOpenHint());v.inventoryOpen=false;assert(!v.chestFirstOpenHint());v.inventoryOpen=true;assert(v.chestFirstOpenHint());assert(make(new Game({progress:g.saveProgress()})).chestFirstOpenHint());
 });
 test(root+' only successful opening dismisses hint permanently',()=>{
  const g=new Game(),v=make(g);g.collectChest({count:5});assert.equal(g.openChests(10),null);assert(v.chestFirstOpenHint());assert(g.openChests(1));assert(!v.chestFirstOpenHint());assert(g.progress.hasOpenedChest);g.acknowledgeChestRewards();g.collectChest({count:20});assert(!make(new Game({progress:g.saveProgress()})).chestFirstOpenHint());
 });
 test(root+' pending rewards prove historical opening and stacked totals trigger hint',()=>{
  const g=new Game();g.collectChest({count:100});assert(make(g).chestFirstOpenHint());g.openChests(1);const s=g.saveProgress();delete s.hasOpenedChest;assert(P.restore(s).hasOpenedChest);
 });
}
