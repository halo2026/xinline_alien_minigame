const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
for(const root of ['../shared']){
 const {View}=require(root+'/view');
 test(root+' returning from background keeps management interactive and cancels interrupted touches',()=>{
  for(const page of ['vehicle','technology']){
   const v=new View({}, {},390,844);v.game.start();v.game.progress.pendingTechnologyGift=false;v.game.progress.pendingLevelEightGift=null;
   v.inventoryOpen=page==='vehicle';v.techTower=page==='technology'?12200:null;
   v.gearDrag={id:1,uid:'invalid',active:true};v.techDrag={id:2,active:true};v.touchIds={3:'move'};v.game.move={x:1,y:1};
   for(let i=0;i<5;i++){v.suspend();v.resume();assert.equal(v.paused,false);}
   assert.equal(v.gearDrag,null);assert.equal(v.techDrag,null);assert.deepEqual(v.touchIds,{});assert.deepEqual(v.game.move,{x:0,y:0});
   // A legacy hidden pause must not swallow every management tap after recovery.
   v.paused=true;v.resume();assert.equal(v.paused,false);
   const tabs=v.managementTabs();v.down(5,tabs[page==='vehicle'?1:0].x+20,tabs[0].y+20);
   v.game.progress.pendingTechnologyGift=false;v.game.progress.pendingLevelEightGift=null;
   assert.equal(!!v.inventoryOpen,page!=='vehicle');
   v.down(6,v.w-35,v.top+30);assert.equal(v.inventoryOpen,false);assert.equal(v.techTower,null);
  }
 });
 test(root+' battle resumes to a working pause menu without advancing combat',()=>{
  const v=new View({}, {},390,844);v.game.start();const before=v.game.time;v.suspend();v.resume();v.step(.1);assert(v.paused);assert.equal(v.game.time,before);const r=v.pauseMenuLayout().resume;v.down(1,r.x+10,r.y+10);assert.equal(v.paused,false);
 });
}
test('native loop recovers from suspended callbacks, clock resets and transient render errors',()=>{
 const source=fs.readFileSync(__dirname+'/../minigame/game.js','utf8'),code=source.slice(source.indexOf('let loopEpoch=0;'),source.indexOf('(async()=>'));
 let next=0,callbacks=new Map(),handlers={},steps=[],draws=0,fail=false,errors=0;
 const context={hidden:false,frame:null,view:{paused:false,resume(){},suspend(){},step(dt){steps.push(dt);},draw(){draws++;if(fail){fail=false;throw Error('transient');}},game:{},flushSave(){}},missionMenu:null,music:null,turning:false,candidate:null,orientationMode:'auto',flipped:false,w:390,h:844,currentMission:'zerg',ctx:{save(){},restore(){}},renderBudget:require('../shared/render-budget'),recordClear:()=>false,drawRotate(){},canGoHome:()=>false,resizeWindow(){},console:{error(){errors++;}},wx:{onHide:f=>handlers.hide=f,onShow:f=>handlers.show=f},requestAnimationFrame:f=>{callbacks.set(++next,f);return next;},cancelAnimationFrame:id=>callbacks.delete(id)};
 vm.createContext(context);vm.runInContext(code+'\nloop();',context);
 const run=t=>{const [id,cb]=callbacks.entries().next().value;callbacks.delete(id);cb(t);};
 run(100);const stale=[...callbacks.values()][0];handlers.hide();handlers.show();stale(999);assert.equal(callbacks.size,1);run(0);assert.equal(steps.at(-1),0);run(600000);assert.equal(steps.at(-1),.1);run(1);assert.equal(steps.at(-1),0);
 fail=true;run(20);assert.equal(errors,1);assert.equal(callbacks.size,1);run(40);assert(draws>=5);
 handlers.show();handlers.show();assert.equal(callbacks.size,1);
});
