const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('WeChat page cold start, hide/show, and unload have one animation loop',async()=>{
 let page,frames=0,cancels=0;const ctx=new Proxy({},{get:(t,k)=>t[k]||(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
 const canvas={getContext:()=>ctx,createImage:()=>{const i={then(){throw Error('native proxy must not be assimilated')}};Object.defineProperty(i,'src',{set(){queueMicrotask(()=>i.onload())}});return i;},requestAnimationFrame:()=>++frames,cancelAnimationFrame:()=>cancels++};
 const wx={getWindowInfo:()=>({pixelRatio:2}),getMenuButtonBoundingClientRect:()=>({bottom:60}),createSelectorQuery:()=>{const q={in:()=>q,select:()=>q,fields:()=>q,exec:cb=>cb([{node:canvas,width:390,height:844}])};return q;},createInnerAudioContext:()=>({play(){},pause(){},stop(){},destroy(){}})};
 const req=p=>p.includes('resource-loader')?async()=>new Proxy({},{get:(_,k)=>k}):require('../shared/view');
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../miniprogram/pages/index/index.js'),'utf8'),{require:req,Page:p=>{page=p},wx,console,setTimeout,clearTimeout});
 page.setData=d=>Object.assign(page.data,d);page.onLoad();page.onShow();assert.equal(frames,0);await page.onReady();await new Promise(r=>setTimeout(r,20));assert.equal(page.data.loading,'');assert.equal(frames,1);page.onHide();assert.equal(cancels,1);page.onShow();assert.equal(frames,2);page.onUnload();assert.equal(page._zergUnloaded,true);assert.equal(cancels,2);
});
