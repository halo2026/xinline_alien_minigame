(function(){
 const layer=document.createElement('canvas');layer.id='launch-cover';layer.style.cssText='position:fixed;inset:0;width:100vw;height:100dvh;z-index:100;background:#060b14;pointer-events:none';document.body.appendChild(layer);
 const old=document.getElementById('loading');if(old)old.style.display='none';const ctx=layer.getContext('2d'),image=new Image();let ready=false,value=0;const ship=new Image();let shipReady=false,lastDraw=0,frame=null;
 function render(){if(!layer.isConnected)return;const dpr=Math.min(2,devicePixelRatio||1);if(layer.width!==Math.round(innerWidth*dpr)||layer.height!==Math.round(innerHeight*dpr)){layer.width=innerWidth*dpr;layer.height=innerHeight*dpr;}ctx.setTransform(dpr,0,0,dpr,0,0);AlienLoading.draw(ctx,ready?image:null,innerWidth,innerHeight,value,'战队正在星际投送中。。。',{ship:shipReady?ship:null,time:performance.now()/1000});}
 ship.onload=()=>{shipReady=true;render();};ship.src='../assets/loading-dropship.png';function animate(t){if(!layer.isConnected)return;if(!document.hidden&&t-lastDraw>=33){render();lastDraw=t;}frame=requestAnimationFrame(animate);}frame=requestAnimationFrame(animate);
 image.onload=()=>{ready=true;render();};image.src='../assets/launch-cover.jpg';addEventListener('resize',render);render();
 window.launchProgress=(done,total)=>{value=total?done/total:0;render();};window.finishLaunchCover=()=>{cancelAnimationFrame(frame);layer.remove();removeEventListener('resize',render);};
 if(old)new MutationObserver(()=>{if(!old.isConnected)window.finishLaunchCover();else if(old.textContent.includes('失败')||old.textContent.includes('Error')){window.finishLaunchCover();old.style.display='';}}).observe(document.body,{childList:true,subtree:true,characterData:true});
})();
