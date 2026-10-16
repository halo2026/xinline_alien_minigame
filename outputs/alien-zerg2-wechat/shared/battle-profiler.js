'use strict';
// Optional five-second windows; do not store player data or write storage per frame.
class BattleProfiler {
 constructor(){this.history=[];this.reset();}
 reset(){this.frames=[];this.last=null;this.elapsed=0;this.update=0;this.draw=0;}
 sample(t,updateMs,drawMs,g,context={}){
  const delta=this.last==null?0:t-this.last;this.last=t;
  if(delta<=0||delta>1000){this.frames=[];this.elapsed=this.update=this.draw=0;return null;}
  this.frames.push(delta);this.elapsed+=delta;this.update+=updateMs;this.draw+=drawMs;
  if(this.elapsed<5000)return null;
  const n=this.frames.length,sorted=this.frames.slice().sort((a,b)=>a-b),round=v=>Math.round(v*100)/100;
  const report={...context,at:Date.now(),wave:g.wave,gameTime:round(g.time),frames:n,fps:round(n*1000/this.elapsed),p95FrameMs:round(sorted[Math.min(n-1,Math.ceil(n*.95)-1)]),slowFrames:this.frames.filter(v=>v>1000/30+1).length,updateMs:round(this.update/n),drawMs:round(this.draw/n),enemies:g.enemies.length,bullets:g.bullets.length,towers:g.towers.length,effects:g.fx.length,corpses:g.corpses.length};
  this.history.push(report);if(this.history.length>24)this.history.shift();this.frames=[];this.elapsed=this.update=this.draw=0;return report;
 }
}
module.exports={BattleProfiler};
