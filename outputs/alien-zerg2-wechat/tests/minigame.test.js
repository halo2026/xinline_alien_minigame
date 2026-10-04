const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('Mini Game waits for assets, selects the wolf campaign, routes native touch coordinates and survives hide/show',async()=>{
 let callbacks={},calls=[],queue=new Map(),seq=0,pending=[],selected,resizes=[];
 class View{constructor(){this.touchIds={};this.game={state:'ready',start(){this.state='playing';}};}resize(...v){resizes.push(v);}down(...v){calls.push(v);}motion(){}up(){}draw(){}step(){}flushSave(){calls.push('save');}}
 class WolfView extends View{constructor(...a){super(...a);selected='wolf';}}
 class MissionMenu{constructor(v,select){this.select=select;}draw(){}down(){this.select('wolf');}}
 const ctx={scale(){},fillRect(){},fillText(){}};
 const wx={createCanvas:()=>({getContext:()=>ctx}),getWindowInfo:()=>({windowWidth:390,windowHeight:844,pixelRatio:3}),getMenuButtonBoundingClientRect:()=>({bottom:80}),loadSubpackage:o=>o.success(),createImage:()=>({set src(v){pending.push(()=>this.onload());}}),getStorageSync(){},setStorageSync(){},onDeviceOrientationChange:f=>callbacks.orientation=f,onWindowResize:f=>callbacks.resize=f,onHide:f=>callbacks.hide=f,onShow:f=>callbacks.show=f,onTouchStart:f=>callbacks.start=f,onTouchMove(){},onTouchEnd(){},onTouchCancel(){},createInnerAudioContext:()=>({play(){},pause(){},stop(){}}),showToast:o=>assert.fail(o.title)};
 const sandbox={wx,console,requestAnimationFrame:f=>{queue.set(++seq,f);return seq;},cancelAnimationFrame:i=>queue.delete(i),require:p=>p.includes('game-assets')?{packages:[],files:{'space-debris.png':'space-debris.png','asteroid-rock.jpg':'asteroid-rock.jpg','deep-space.jpg':'deep-space.jpg','terrain.png':'terrain.png','wolf-terrain.png':'wolf-terrain.png'}}:p.includes('mission-menu')?{MissionMenu}:p.includes('art-data')?{pages:[]}:p.includes('progression')?{KEY:'save'}:{View:p.includes('/wolf/')?WolfView:View}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../minigame/game.js'),'utf8'),sandbox);
 assert.equal(callbacks.start,undefined);for(let i=0;i<4;i++){pending.shift()();await new Promise(r=>setImmediate(r));}assert.equal(queue.size,1);
 callbacks.start({changedTouches:[{identifier:1,clientX:80,clientY:100}]});assert(!selected);pending.shift()();await new Promise(r=>setImmediate(r));assert.equal(selected,'wolf');callbacks.resize({size:{windowWidth:844,windowHeight:390}});assert.deepEqual(resizes.at(-1),[844,390,6]);calls=[];
 sandbox.flipLandscape();assert.deepEqual(JSON.parse(JSON.stringify(sandbox.touchPoint({clientX:20,clientY:30}))),{x:824,y:360});
 callbacks.orientation({value:'landscapeReverse'});
 assert.deepEqual(JSON.parse(JSON.stringify(sandbox.touchPoint({clientX:20,clientY:30}))),{x:20,y:30});
 assert.equal(sandbox.topInset({safeArea:{top:190},statusBarHeight:190},844,390),6);
 assert.equal(sandbox.topInset({safeArea:{top:0},statusBarHeight:44},844,390),6);
 assert.equal(sandbox.topInset({safeArea:{top:24}},844,390),30);
 callbacks.resize({size:{windowWidth:390,windowHeight:844}});assert.deepEqual(resizes.at(-1),[390,844,86]);
 callbacks.start({changedTouches:[{identifier:1,clientX:20,clientY:30},{identifier:2,x:40,y:50}]});assert.deepEqual(calls,[[1,20,30],[2,40,50]]);
 callbacks.hide();assert.equal(calls.at(-1),'save');assert.equal(queue.size,0);callbacks.show();callbacks.show();assert.equal(queue.size,1);
});
