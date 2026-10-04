const {View,load}=require('./shared/view');
const {KEY}=require('./shared/progression');
const assets=require('./shared/game-assets');
const canvas=wx.createCanvas(),ctx=canvas.getContext('2d');
const info=wx.getWindowInfo?wx.getWindowInfo():wx.getSystemInfoSync();
const w=info.windowWidth,h=info.windowHeight,dpr=info.pixelRatio||1;
canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);
let view=null,hidden=false,frame=null,music=null,sounds={};
function message(s){ctx.fillStyle='#111b1d';ctx.fillRect(0,0,w,h);ctx.fillStyle='#eadbb8';ctx.font='16px sans-serif';ctx.textAlign='center';ctx.fillText(s,w/2,h*.45);}
function loop(){if(hidden||!view||frame!==null)return;let prev=0;const tick=t=>{if(hidden){frame=null;return;}view.step(prev?(t-prev)/1000:0);prev=t;view.draw();frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);}
wx.onHide(()=>{hidden=true;if(frame!==null)cancelAnimationFrame(frame);frame=null;if(music)music.pause();if(view){view.flushSave(true);view.gearDrag=null;view.paused=true;for(const id in view.touchIds)view.up(id);}});
wx.onShow(()=>{hidden=false;loop();});
(async()=>{try{
 for(let i=0;i<assets.packages.length;i++){message(`正在载入原作资源 ${i+1}/${assets.packages.length}`);await new Promise((resolve,reject)=>wx.loadSubpackage({name:assets.packages[i].name,success:resolve,fail:reject}));}
 const images=await load(()=>wx.createImage(),f=>assets.files[f],(i,n)=>message(`正在解码图片 ${i}/${n}`));
 const menu=wx.getMenuButtonBoundingClientRect?wx.getMenuButtonBoundingClientRect():{bottom:info.statusBarHeight||0};
 view=new View(ctx,images,w,h,menu.bottom+6,{load:()=>wx.getStorageSync(KEY),save:data=>wx.setStorageSync(KEY,data)});
wx.onTouchStart(e=>{if(view)for(const t of e.changedTouches)view.down(t.identifier,t.clientX??t.x,t.clientY??t.y);});
wx.onTouchMove(e=>{if(view)for(const t of e.changedTouches)view.motion(t.identifier,t.clientX??t.x,t.clientY??t.y);});
const end=e=>{if(view)for(const t of e.changedTouches)view.up(t.identifier,t.clientX??t.x,t.clientY??t.y);};wx.onTouchEnd(end);wx.onTouchCancel(e=>{if(view)for(const t of e.changedTouches)view.up(t.identifier,undefined,undefined,true);});

 try{music=wx.createInnerAudioContext();music.src=assets.files['stage_01.mp3'];music.loop=true;music.volume=.15;
 for(const [kind,file] of [['nuke','a_bomb.wav'],['shield','magic3.wav'],['ice','magic14.wav'],['satellite','shot10.wav'],['throw','weapon_swing.wav'],['laser','heavy_laser.wav'],['grenade','boomb.wav'],['build','build2.wav'],['gun','qiang6.wav'],['shotgun','shotgun-native.wav'],['rocket','rocket-launch.wav'],['impale','impale-native.wav'],['energy','magic5.wav'],['shockwave','teleport.wav'],['lightsaber','weapon_lightsaber.wav'],['sword','weapon_sword.wav'],['fire','fire.wav']]){const a=wx.createInnerAudioContext();a.src=assets.files[file];a.volume=.10;sounds[kind]=a;}
 view.onSound=e=>{if(e==='musicStart')music.play();if(e==='musicPause')music.pause();const a=sounds[e];if(a){a.stop();a.play();}};
 }catch(e){console.warn('[Zerg audio]',e);}
 view.draw();loop();
}catch(e){console.error('[Zerg startup]',e);message('加载失败：'+(e.message||e.errMsg||String(e)));}})();
