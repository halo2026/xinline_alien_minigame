let View,load,MissionMenu,recordClear,KEY,fresh,campaignSelectionUnlocked;const stages={};
const assets=require('./shared/game-assets');
const renderBudget=require('./shared/render-budget');
const loadingScreen=require('./shared/loading-screen');
let launchShip=null,bootTimer=null;
let launchCover=null,loadProgress=0,loadLabel='战队正在星际投送中。。。';
const canvas=wx.createCanvas(),ctx=canvas.getContext('2d');
const info=wx.getWindowInfo?wx.getWindowInfo():wx.getSystemInfoSync();
let w=info.windowWidth,h=info.windowHeight;const dpr=renderBudget.pixelRatio(info.pixelRatio);
canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);
let currentMission='zerg';
let view=null,hidden=false,frame=null,music=null,sounds={},missionMenu=null,loading=false,imagesCache=new Map();
const cloudConfig=require('./shared/cloud-config');
let cloudStore=null,syncBlocked=false,cloudErrorShown=false;
const storage={load:()=>cloudStore?cloudStore.load():wx.getStorageSync(KEY),save:(data,mission=currentMission)=>cloudStore?cloudStore.save({...data,lastCampaign:mission}):wx.setStorageSync(KEY,{...data,lastCampaign:mission})};
function modal(options){return new Promise(resolve=>wx.showModal({...options,success:resolve,fail:()=>resolve({cancel:true})}));}
let conflictRecord=null,conflictDialog=false;
function cloudConflictRetry(){if(conflictRecord&&!conflictDialog)cloudConflict(conflictRecord).catch(console.error);}
async function cloudConflict(record){
 if(conflictDialog)return;conflictRecord=record;conflictDialog=true;
 syncBlocked=true;view?.suspend();music?.pause();
 const answer=await modal({title:'发现其他设备的进度',content:'本机存档已备份。继续将读取云端最新进度，当前战斗从本幕开始。',confirmText:'读取云存档',cancelText:'暂不继续'});
 conflictDialog=false;if(!answer.confirm)return;
 while(loading)await new Promise(resolve=>setTimeout(resolve,100));
 cloudStore.useRemote(record);conflictRecord=null;view=null;missionMenu=null;
 await selectMission(stages[record.data.lastCampaign]?record.data.lastCampaign:currentMission);syncBlocked=false;
}
async function startCloud(){
 if(!cloudConfig.env)return;
 if(!wx.cloud)throw new Error('微信版本不支持云存档，请更新微信');
 wx.cloud.init({env:cloudConfig.env,traceUser:false});
 const {CloudSave}=require('./defense-code/cloud-save');
 cloudStore=new CloudSave({key:KEY,local:{get:k=>wx.getStorageSync(k),set:(k,v)=>wx.setStorageSync(k,v)},
  call:async data=>{let timer;try{return await Promise.race([wx.cloud.callFunction({name:cloudConfig.functionName,data:{...data,epoch:cloudConfig.epoch,slot:(wx.getDeviceInfo?.()||wx.getSystemInfoSync()).platform==='devtools'?'simulator':'player'}}).then(r=>r.result),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('云存档连接超时')),12000);})]);}finally{clearTimeout(timer);}},
  chooseRemote:async()=>{const r=await modal({title:'发现两份不同进度',content:'云端已有其他设备的更新。本机进度会保留备份，读取云端进度后继续。',confirmText:'读取云存档',cancelText:'稍后重试'});return !!r.confirm;},
  onConflict:record=>{cloudConflict(record).catch(e=>console.error('[Cloud conflict]',e));},
  onStatus:status=>{if(status==='offline'&&!cloudErrorShown){cloudErrorShown=true;wx.showToast({title:'进度已存本机，等待云端同步',icon:'none'});}if(status==='saved')cloudErrorShown=false;if(status==='recovered')wx.showToast({title:'已读取云端进度，本地档已备份',icon:'none'});}
 });
 for(;;){try{message('正在同步战队进度。。。');await cloudStore.start();return;}catch(e){console.warn('[Cloud startup]',e);const answer=await modal({title:'暂时无法同步存档',content:'本机进度仍保留。请检查网络或云开发配置，重试后再进入，避免覆盖其他设备的进度。',confirmText:'重试',showCancel:false});if(!answer.confirm)throw e;}}
}
// Ordinary network refresh must never hold the touch/UI lock across backgrounding.
// Only an actual revision conflict or an explicit reset may suspend interaction.
let cloudRefreshing=false;
async function refreshCloud(){if(!cloudStore||!view||syncBlocked||cloudRefreshing)return;cloudRefreshing=true;try{view.flushSave(true);await cloudStore.refresh();}catch(e){console.warn('[Cloud refresh]',e);}finally{cloudRefreshing=false;}}

// Landscape capsule coordinates can remain in portrait space during rotation.
// Use only the top safe inset; the side capsule must not push the HUD down.
function topInset(i,width,height){
 if(width>height){const safe=Number(i.safeArea?.top),status=Number(i.statusBarHeight);return Math.max(0,Number.isFinite(safe)&&safe<=40?safe:Number.isFinite(status)&&status<=40?status:0)+6;}
 return (wx.getMenuButtonBoundingClientRect?.().bottom||i.statusBarHeight||0)+6;
}
let top=topInset(info,w,h);
function resizeWindow(event){const i=wx.getWindowInfo?wx.getWindowInfo():wx.getSystemInfoSync(),size=event?.size||i;const nw=size.windowWidth||i.windowWidth,nh=size.windowHeight||i.windowHeight;if((nw>nh)!==(w>h))flipped=false;w=nw;h=nh;top=topInset(i,w,h);canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);view?.resize?.(w,h,top);if(!view)message(loadLabel);}
wx.onWindowResize?.(resizeWindow);
let flipped=false;
let turning=false,lastTurn=0,candidate=null,candidateAt=0;
const orientationKey='alien-screen-direction';let orientationMode=wx.getStorageSync(orientationKey)||'auto';if(!['auto','portrait','landscape'].includes(orientationMode))orientationMode='auto';
function chooseOrientation(value){if(!['auto','portrait','landscape'].includes(value))return;orientationMode=value;wx.setStorageSync(orientationKey,value);candidate=null;if(value!=='auto')turn(value);}
function bindOrientation(v){v.getOrientationMode=()=>orientationMode;v.onOrientationChange=chooseOrientation;v.onRestartGame=restartGame;}
function turn(value){if(turning||!wx.setDeviceOrientation)return;turning=true;wx.setDeviceOrientation({value,success:()=>{lastTurn=Date.now();resizeWindow();},fail:e=>{console.warn('[Orientation]',e);},complete:()=>{turning=false;}});}
wx.onAccelerometerChange?.(a=>{const now=Date.now();if(hidden||turning||orientationMode!=='auto'||now-lastTurn<2000||Math.abs(a.z)>.85)return;const value=Math.abs(a.x)>.72&&Math.abs(a.y)<.45?'landscape':Math.abs(a.y)>.72&&Math.abs(a.x)<.45?'portrait':null;if(!value){candidate=null;return;}if(candidate!==value){candidate=value;candidateAt=now;}else if(now-candidateAt>900&&value!==(w>h?'landscape':'portrait'))turn(value);});
// Native left/right landscape rotation already rotates the canvas. Never rotate it twice.
wx.onDeviceOrientationChange?.(()=>{flipped=false;resizeWindow();});
function touchPoint(t){return {x:t.clientX??t.x,y:t.clientY??t.y};}
wx.startAccelerometer?.({interval:'normal',fail:e=>console.warn('[Orientation sensor]',e)});
if(orientationMode!=='auto')turn(orientationMode);
function imageFile(file){
 if(imagesCache.has(file))return imagesCache.get(file);
 const attempt=()=>new Promise((resolve,reject)=>{const src=assets.files[file];if(!src){reject(new Error('缺少关卡素材：'+file));return;}const i=wx.createImage();let done=false;const finish=(error)=>{if(done)return;done=true;clearTimeout(timer);i.onload=i.onerror=null;error?reject(error):resolve(i);},timer=setTimeout(()=>finish(new Error('素材解码超时：'+file)),15000);i.onload=()=>finish();i.onerror=e=>finish(new Error('素材加载失败：'+file+' '+(e?.errMsg||'')));i.src=src;});
 const pending=attempt().catch(()=>attempt()).catch(error=>{if(imagesCache.get(file)===pending)imagesCache.delete(file);throw error;});imagesCache.set(file,pending);return pending;
}
async function stageImages(id){const a=stages[id].art;return {desert:id==='airship3'?await imageFile('airship-desert.jpg'):null,campaignSpace:await imageFile('campaign-space.jpg'),campaignNebula:await imageFile('campaign-nebula.jpg'),campaignNodes:await imageFile('campaign-nodes.png'),portraits:await imageFile('operator-portraits.jpg'),sideCave:['zerg1','zerg','greenstar'].includes(id)?await imageFile('hive-cave-side.png'):null,caves:id!=='wolf'?await Promise.all(['hive-cave-a.png','hive-cave-b.png'].map(imageFile)):[],debris:id!=='wolf'?await imageFile('space-debris.png'):null,rock:id!=='wolf'?await imageFile('asteroid-rock.jpg'):null,space:id!=='wolf'?await imageFile('deep-space.jpg'):null,terrain:await imageFile(id==='wolf'?'wolf-terrain.png':id==='zerg'?'terrain.png':id+(id==='greenstar'?'-terrain.jpg':'-terrain.png')),pages:await Promise.all(a.pages.map(imageFile))};}
function sound(e){if(e==='musicStart')music?.play();if(e==='musicPause')music?.pause();const a=sounds[e];if(a){a.stop();a.play();}}
async function selectMission(id){
 if(loading)return;loading=true;let phase='保存当前进度';
 try{
  const previous=view;
  previous?.flushSave(true);
  if(previous?.saveError)throw previous.saveFailure||new Error('当前进度尚未保存');
  // Hand off the live battle snapshot; a failed read must never create a new player.
  const progress=previous?previous.game.saveProgress():storage.load();
  if(progress)wx.setStorageSync(KEY+':campaign-backup',{at:Date.now(),mission:currentMission,data:progress});
  phase='加载关卡素材';const images=await stageImages(id);
  // Build completely before publishing the new view or allowing it to save.
  phase='初始化关卡';const next=new stages[id].api.View(ctx,images,w,h,top,{load:()=>progress});
  next.resize?.(w,h,top);bindOrientation(next);
  next.onSound=sound;next.onNextCampaign=selectMission;next.onExitCampaign=showMissions;
  next.game.start();
  phase='保存切换进度';storage.save(next.game.saveProgress(),id);
  next.storage=storage;next.game.progressDirty=false;
  if(previous)previous.storage=null;
  view=next;currentMission=id;missionMenu=null;
 }catch(e){console.error('[Mission load; original progress retained]',id,phase,e);const detail=String(e?.cause?.message||e?.message||e?.errMsg||e);try{wx.setStorageSync(KEY+':mission-error',{mission:id,phase,detail,at:Date.now()});}catch(_){}wx.showModal({title:phase+'未完成',content:'原进度已保留，请重试。\n'+detail.slice(0,200),showCancel:false,confirmText:'知道了'});}
 finally{loading=false;}
}
let restarting=false;
async function restartGame(){
 if(restarting||loading||syncBlocked)return;
 restarting=true;
 try{
  const answer=await modal({title:'一切重新开始',content:'确认清空当前玩家的等级、资源、装备、操作员、科技和所有关卡进度？确认后将从第一关重新开始，此操作无法撤销。',confirmText:'确认重来',cancelText:'取消',confirmColor:'#cf5147'});
  if(!answer.confirm)return;
  syncBlocked=true;view.suspend();music?.pause();
  // Resolve queued writes and check the account revision before replacing progress.
  if(cloudStore){await cloudStore.refresh();if(cloudStore.blocked)return;}
  const images=await stageImages('zerg');
  const data={...fresh(),lastCampaign:'zerg'};
  if(cloudStore)cloudStore.save(data);else wx.setStorageSync(KEY,data);
  // Detach the old battle so hide events and mission switching cannot save it again.
  view.storage=null;currentMission='zerg';missionMenu=null;
  view=new stages.zerg.api.View(ctx,images,w,h,top,storage);
  view.resize?.(w,h,top);bindOrientation(view);view.onSound=sound;view.onNextCampaign=selectMission;view.onExitCampaign=showMissions;view.game.start();
  if(cloudStore)await cloudStore.flush();
 }catch(e){console.error('[Restart game]',e);wx.showToast({title:'同步未完成，请检查网络',icon:'none'});}
 finally{restarting=false;if(!cloudStore?.blocked)syncBlocked=false;}
}
function showMissions(){view.flushSave(true);music?.pause();missionMenu=new MissionMenu(view,selectMission,view.paused&&view.game.state==='playing'?()=>{view.paused=false;missionMenu=null;}:null);}
function homeRect(){return {x:w/2-90,y:h*.52+60,w:180,h:36};}
function canGoHome(){return campaignSelectionUnlocked(view.game.progress)&&!missionMenu&&!view.inventoryOpen&&!view.techTower&&!view.shop&&(!view.paused&&view.game.state==='won');}

function message(s,p=loadProgress){loadLabel=s;loadProgress=p;loadingScreen.draw(ctx,launchCover,w,h,p,s,{ship:launchShip,time:Date.now()/1000});}
// Invalidate callbacks across app visibility changes; old frames must never revive a second loop.
let loopEpoch=0;
function stopLoop(){loopEpoch++;if(frame!==null)cancelAnimationFrame(frame);frame=null;}
function loop(){if(hidden||!view||frame!==null)return;let prev=null;const epoch=loopEpoch;
 const tick=t=>{if(epoch!==loopEpoch)return;frame=null;if(hidden)return;
  try{if(!view||loading)return;if(!renderBudget.due(t,prev,renderBudget.interval(view,missionMenu)))return;
   const dt=prev==null?0:Math.max(0,Math.min(.1,(t-prev)/1000));prev=t;
   ctx.save();try{if(flipped&&w>h){ctx.translate(w,h);ctx.rotate(Math.PI);}if(missionMenu)missionMenu.draw();else{if(!syncBlocked)view.step(dt);if(recordClear(view.game,currentMission))view.flushSave(true);view.draw();if(canGoHome()){const r=homeRect();view.gearPanel(r.x,r.y,r.w,r.h,'#263641');view.text('战役选择',w/2,r.y+25,15,'#cfdee0','center');}}}finally{ctx.restore();}
  }catch(e){console.error('[Game frame]',e);}finally{if(!hidden&&epoch===loopEpoch)frame=requestAnimationFrame(tick);}
 };frame=requestAnimationFrame(tick);
}
wx.onHide(()=>{hidden=true;stopLoop();if(music)music.pause();if(missionMenu)missionMenu.drag=null;if(view)view.suspend();cloudStore?.flush().catch(()=>{});});
wx.onShow(()=>{hidden=false;stopLoop();view?.resume();if(missionMenu)missionMenu.drag=null;turning=false;candidate=null;resizeWindow();if(orientationMode!=='auto')turn(orientationMode);loop();refreshCloud();});
(async()=>{try{
 const ship=wx.createImage();ship.onload=()=>{launchShip=ship;};ship.src='loading-dropship.png';bootTimer=setInterval(()=>{if(!hidden)message(loadLabel);},33);
 message('战队正在星际投送中。。。',0);await new Promise(resolve=>{const i=wx.createImage();let settled=false;const finish=()=>{if(settled)return;settled=true;clearTimeout(timer);resolve();};const timer=setTimeout(finish,5000);i.onload=()=>{if(settled)return;launchCover=i;message(loadLabel);finish();};i.onerror=finish;i.src='launch-cover.jpg';});
 for(let i=0;i<assets.packages.length;i++){const label='战队正在星际投送中。。。';message(label,i/assets.packages.length*.85);await new Promise((resolve,reject)=>{const task=wx.loadSubpackage({name:assets.packages[i].name,success:()=>{message(label,(i+1)/assets.packages.length*.85);resolve();},fail:reject});task?.onProgressUpdate?.(e=>message(label,(i+Math.max(0,Math.min(100,e.progress))/100)/assets.packages.length*.85));});}message('战队正在星际投送中。。。',.9);

 ({View,load}=require('./shared/view'));({MissionMenu,recordClear}=require('./shared/mission-menu'));Object.assign(stages,{zerg:{api:require('./shared/view'),art:require('./shared/art-data')},wolf:{api:require('./shared/campaigns/wolf/view'),art:require('./shared/campaigns/wolf/art-data')}});({KEY,fresh,campaignSelectionUnlocked}=require('./shared/progression'));require('./shared/bestiary').configure(imageFile);
 stages.zerg1=require('./shared/zerg1');
 const defense=require('./shared/defense-campaign'),art=require('./defense-code/defense-art');
 for(const id of ['snake3','fish3','airship3','fortress2','scorpion2'])stages[id]=defense.create(require('./defense-code/'+id+'-data'),art);
 stages.greenstar=require('./shared/greenstar');
 await startCloud();
 const images=await stageImages('zerg');
 view=new View(ctx,images,w,h,top,storage);view.resize?.(w,h,top);bindOrientation(view);const savedMission=cloudStore?.load()?.lastCampaign;if(stages[savedMission]&&!view.game.progress.campaignClears?.[savedMission])await selectMission(savedMission);else if(campaignSelectionUnlocked(view.game.progress))showMissions();else await selectMission(view.game.progress.campaignClears?.zerg?'zerg1':'zerg');
wx.onTouchStart(e=>{if(syncBlocked&&cloudStore?.blocked){cloudConflictRetry();return;}if(!view||loading||syncBlocked)return;for(const t of e.changedTouches){const {x,y}=touchPoint(t);if(missionMenu){missionMenu.down(x,y);return;}if(canGoHome()){const r=homeRect();if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h){showMissions();return;}}view.down(t.identifier,x,y);}});
wx.onTouchMove(e=>{if(view&&!loading&&!syncBlocked)for(const t of e.changedTouches){const {x,y}=touchPoint(t);if(missionMenu)missionMenu.move(x,y);else view.motion(t.identifier,x,y);}});
const end=e=>{if(view&&!syncBlocked)for(const t of e.changedTouches){const {x,y}=touchPoint(t);if(missionMenu)missionMenu.up(x,y);else view.up(t.identifier,x,y);}};wx.onTouchEnd(end);wx.onTouchCancel(e=>{if(view)for(const t of e.changedTouches){if(missionMenu)missionMenu.drag=null;else view.up(t.identifier,undefined,undefined,true);}});

 try{music=wx.createInnerAudioContext();music.src=assets.files['stage_01.mp3'];music.loop=true;music.volume=.15;
 for(const [kind,file] of [['nuke','a_bomb.wav'],['shield','magic3.wav'],['ice','magic14.wav'],['satellite','shot10.wav'],['throw','weapon_swing.wav'],['laser','heavy_laser.wav'],['grenade','boomb.wav'],['build','build2.wav'],['gun','qiang6.wav'],['shotgun','shotgun-native.wav'],['rocket','rocket-launch.wav'],['impale','impale-native.wav'],['energy','magic5.wav'],['shockwave','teleport.wav'],['lightsaber','weapon_lightsaber.wav'],['sword','weapon_sword.wav'],['fire','fire.wav']]){const a=wx.createInnerAudioContext();a.src=assets.files[file];a.volume=.10;sounds[kind]=a;}
 view.onSound=e=>{if(e==='musicStart')music.play();if(e==='musicPause')music.pause();const a=sounds[e];if(a){a.stop();a.play();}};
 }catch(e){console.warn('[Zerg audio]',e);}
 if(cloudStore)setInterval(()=>{if(!hidden&&!syncBlocked)refreshCloud();},30000);
 message('准备就绪',1);await new Promise(resolve=>setTimeout(resolve,180));clearInterval(bootTimer);bootTimer=null;view.draw();loop();
}catch(e){clearInterval(bootTimer);bootTimer=null;console.error('[Zerg startup]',e);message('加载失败：'+(e.message||e.errMsg||String(e)));}})();
