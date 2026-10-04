const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared']){
 const {View}=require(root+'/view'),P=require(root+'/progression');
 test(root+' early inventory visit does not consume level five hint; actual level button dismisses permanently',()=>{
  const v=new View({}, {},390,844);v.game.start();v.game.progress.level=4;v.switchManagement('vehicle');assert(v.game.progress.managementVisited);v.closeManagement();assert(!v.levelButtonHint());v.game.progress.level=5;assert(v.levelButtonHint());v.game.progress=P.restore(v.game.saveProgress());assert(v.levelButtonHint());const r=v.vehicleHUDLayout();v.down(1,r.buttonX+r.buttonW/2,r.y+r.h/2);assert(v.inventoryOpen);assert(v.game.progress.levelFiveHintAcknowledged);v.closeManagement();assert(!v.levelButtonHint());v.game.progress=P.restore(v.game.saveProgress());v.game.progress.level=6;assert(!v.levelButtonHint());
 });
 test(root+' old visited flag and pre-five button click cannot suppress new hint',()=>{
  const v=new View({}, {},390,844);v.game.progress.level=4;v.acknowledgeLevelButtonHint();assert(!v.game.progress.levelFiveHintAcknowledged);const s=v.game.saveProgress();delete s.levelFiveHintAcknowledged;s.managementVisited=true;s.level=5;v.game.progress=P.restore(s);assert(v.levelButtonHint());v.inventoryOpen=true;assert(!v.levelButtonHint());v.inventoryOpen=false;v.techTower=12200;assert(!v.levelButtonHint());v.techTower=null;assert(v.levelButtonHint());
 });
}
