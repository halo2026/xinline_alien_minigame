const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../shared/progression'),{View}=require('../shared/view');
const source=fs.readFileSync(require.resolve('../minigame/game.js'),'utf8');
const selectSource=source.slice(source.indexOf('async function selectMission(id)'),source.indexOf('\nlet restarting='));
function progressed(){return {...P.fresh(),towerEquipment:{'12200:0':3},warehouse:Array(48).fill(null),level:18,xp:123,chips:321,kryptonite:42,allocated:{firepower:5},campaignActs:{zerg:{act:3,gold:9000,cards:{}}},campaignClears:{zerg:true},bestiary:{[require('../shared/bestiary-data').entries[0].key]:{kills:50,unlocked:true}}};}
function harness(ViewType=View){
 let data=progressed(),readFails=false,writeFails=false;const writes=[],backups=[],toasts=[];
 const storage={load(){if(readFails)throw Error('storage read failed');return structuredClone(data);},save(s,id){if(writeFails)throw Error('storage full');data=structuredClone(s);writes.push({data,id});}};
 const original=new View({}, {pages:[]},390,844,0,storage);
 const c=vm.createContext({view:original,loading:false,currentMission:'zerg',missionMenu:{open:true},storage,KEY:P.KEY,wx:{setStorageSync:(...args)=>backups.push(args),showToast:o=>toasts.push(o),showModal:o=>toasts.push(o)},sceneCache:require('../shared/scene-cache'),imagesCache:new Map(),stageImages:async()=>({pages:[],files:new Set()}),stages:{zerg1:{api:{View:ViewType}}},ctx:{},w:390,h:844,top:0,bindOrientation(){},sound(){},showMissions(){},console:{error(){}},Date});
 vm.runInContext(selectSource,c);
 return {c,original,writes,backups,toasts,readFail:()=>readFails=true,writeFail:()=>writeFails=true,get data(){return data;}};
}
test('nonempty damaged saves throw instead of silently resetting the player',()=>{
 for(const raw of ['{',{}, {...progressed(),xp:null},{...progressed(),inventory:null},{...progressed(),towerTechVersion:6,towerPaths:{12200:42}}])assert.throws(()=>P.restore(raw),{code:'PROGRESS_LOAD_FAILED'});
 for(const raw of [null,undefined,''])assert.equal(P.restore(raw).level,1);
});
test('view cannot overwrite storage after read or parse failure',()=>{
 let writes=0;for(const load of [()=>{throw Error('read failed');},()=>'{',()=>({...progressed(),version:100})])assert.throws(()=>new View({}, {},390,844,0,{load,save(){writes++;}}));
 assert.equal(writes,0);
});
test('creating a view defers migration writes until construction has succeeded',()=>{let writes=0;const v=new View({}, {},390,844,0,{load:()=>null,save:()=>writes++});assert.equal(writes,0);v.flushSave();assert.equal(writes,1);});
test('campaign handoff uses live progress even when storage reads fail',async()=>{
 const h=harness(require('../shared/zerg1').api.View);h.readFail();h.original.game.progress.chips=456;await h.c.selectMission('zerg1');
 assert.notEqual(h.c.view,h.original);assert.equal(h.c.currentMission,'zerg1');assert.equal(h.data.level,18);assert.equal(h.data.chips,456);assert.equal(h.data.kryptonite,42);assert.equal(h.data.campaignClears.zerg,true);assert.equal(h.backups[0][1].data.chips,456);assert.equal(h.original.storage,null);assert.equal(h.c.view.storage,h.c.storage);assert.equal(h.writes.at(-1).id,'zerg1');assert.equal(h.toasts.length,0);
});
test('failed save or new stage construction leaves the old battle attached',async()=>{
 for(const fault of ['save','image','constructor','start']){
  const Type=fault==='constructor'?class{constructor(){throw Error('constructor failure');}}:fault==='start'?class{constructor(){this.game={start(){throw Error('start failure');}};}}:View;
  const h=harness(Type);if(fault==='save')h.writeFail();if(fault==='image')h.c.stageImages=async()=>{throw Error('image failure');};
  await h.c.selectMission('zerg1');assert.equal(h.c.view,h.original,fault);assert.equal(h.c.currentMission,'zerg',fault);assert(h.original.storage);assert.equal(h.data.level,18);assert.equal(h.toasts.length,1);assert.equal(h.c.loading,false);
 }
});
test('all campaigns retain persistent progression across repeated complete handoffs',()=>{
 const defense=require('../shared/defense-campaign'),art=require('../shared/defense-art');
 const stages=[{api:{View}},require('../shared/mine4'),require('../shared/zerg1'),...['snake3','airship3'].map(id=>defense.create(require('../shared/'+id+'-data'),art)),require('../shared/greenstar'),...['fish3','fortress2','scorpion2'].map(id=>defense.create(require('../shared/'+id+'-data'),art))];
 let data=progressed();for(const id of ['zerg1','snake3','airship3','greenstar','fish3','fortress2','scorpion2'])data.campaignActs[id]={act:2,gold:2400,cards:{}};for(let round=0;round<3;round++)for(const stage of stages){const v=new stage.api.View({}, {pages:[]},390,844,0,{load:()=>data,save:s=>data=s});v.resize(390,844,98);v.game.start();v.flushSave(true);assert.equal(data.towerEquipment['12200:0'],3);assert.equal(data.level,18);assert.equal(data.chips,321);assert.equal(data.kryptonite,42);assert.equal(data.xp,123);assert.equal(data.allocated.firepower,5);assert.equal(Object.values(data.bestiary)[0].kills,50);assert.equal(data.campaignClears.zerg,true);}
});

test('switch failure identifies its phase and actual reason without exposing or replacing progress',async()=>{const h=harness();h.c.stageImages=async()=>{throw Error('素材加载失败：airship-desert.jpg');};await h.c.selectMission('zerg1');assert.equal(h.toasts[0].title,'加载关卡素材未完成');assert.match(h.toasts[0].content,/airship-desert.jpg/);assert.equal(h.c.view,h.original);assert.equal(h.backups.at(-1)[1].phase,'加载关卡素材');assert(!('data' in h.backups.at(-1)[1]));});
