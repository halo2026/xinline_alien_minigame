const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared']){
 const {Game}=require(root+'/core'),{View}=require(root+'/view'),P=require(root+'/progression');
 const make=g=>Object.assign(Object.create(View.prototype),{game:g,inventoryOpen:true,flushSave(){this.saved=this.game.saveProgress();}});
 const finish=g=>Object.assign(g.progress,{resourceIntroStep:5,attributeIntroDone:true});
 test(root+' hint waits for all equipment teaching and ten boxes, including stacked totals',()=>{
  const g=new Game(),v=make(g);g.collectChest({count:100});for(let step=0;step<5;step++){g.progress.resourceIntroStep=step;assert(!v.chestFirstOpenHint());}g.progress.resourceIntroStep=5;assert(!v.chestFirstOpenHint());finish(g);assert(v.chestFirstOpenHint());v.inventoryOpen=false;assert(!v.chestFirstOpenHint());v.inventoryOpen=true;assert(make(new Game({progress:g.saveProgress()})).chestFirstOpenHint());
  const h=new Game();finish(h);h.collectChest({count:9});assert(!make(h).chestFirstOpenHint());h.collectChest({count:1});assert(make(h).chestFirstOpenHint());
 });
 test(root+' clicking without opening dismisses hint permanently and saves immediately',()=>{
  const g=new Game(),v=make(g);finish(g);g.collectChest({count:10});assert(v.chestFirstOpenHint());v.openChestDialog();assert(v.chestDialog);assert.equal(g.chestCount(),10);assert(!g.progress.hasOpenedChest);assert(v.saved.hasClickedChest);v.chestDialog=false;assert(!v.chestFirstOpenHint());assert(!make(new Game({progress:v.saved})).chestFirstOpenHint());
 });
 test(root+' real warehouse click saves acknowledgment without consuming boxes',()=>{
  let saved;const v=new View({}, {},390,844,0,{load:()=>null,save:p=>saved=p});finish(v.game);v.inventoryOpen=true;v.game.collectChest({count:10});P.syncWarehouseMaterials(v.game.progress);const s=v.game.progress,item=s.inventory.find(P.isChest),index=s.warehouse.indexOf(item.uid);v.inventoryPage=Math.floor(index/24);const L=v.gearLayout(),cell=index%24;v.down(1,L.gridX+(cell%6+.5)*L.cell,L.gridY+(Math.floor(cell/6)+.5)*L.cell);assert(v.chestDialog);assert(saved.hasClickedChest);assert.equal(v.game.chestCount(),10);assert(!v.chestFirstOpenHint());
 });
 test(root+' old saves with opened or pending rewards stay dismissed; untouched old saves remain eligible',()=>{
  const g=new Game();finish(g);g.collectChest({count:10});const untouched=g.saveProgress();delete untouched.hasClickedChest;assert(make(new Game({progress:untouched})).chestFirstOpenHint());g.openChests(1);const s=g.saveProgress();delete s.hasClickedChest;delete s.hasOpenedChest;assert(P.restore(s).hasClickedChest);assert(!make(new Game({progress:s})).chestFirstOpenHint());
 });
}
