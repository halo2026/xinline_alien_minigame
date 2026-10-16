// Bound fill rate on high-density / high-refresh phones without slowing simulation.
(function(){
function pixelRatio(ratio){return Math.max(1,Math.min(2,Number(ratio)||1));}
function interval(view,menu){return 1000/(view?.paused?15:(menu||view?.levelEquipmentGuideActive?.()||view?.game?.buildSelected||view?.inventoryOpen||view?.techTower||view?.attributesOpen||view?.shop||view?.selectedTower||view?.chestDialog||view?.game?.progress?.pendingChestRewards)?30:60);}
function due(now,last,period){return last==null||now<last||now-last>=period-.75;}
// Keep a stable deadline instead of discarding the remainder on each draw.
// Simulation still uses actual elapsed time in the caller, independently of this clock.
function createScheduler(){let next=null,last=null,previousPeriod=null;return {due(now,period){
 if(next==null||now<last||period!==previousPeriod){next=now;previousPeriod=period;}
 last=now;const tolerance=Math.min(4,period*.24);
 if(now<next-tolerance)return false;
 next+=period;if(next<=now-tolerance)next=now+period;
 return true;
}};}
const api={pixelRatio,interval,due,createScheduler};if(typeof module!=='undefined')module.exports=api;else globalThis.AlienRenderBudget=api;
})();
