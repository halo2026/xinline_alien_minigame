// Bound fill rate on high-density / high-refresh phones without slowing simulation.
(function(){
function pixelRatio(ratio){return Math.max(1,Math.min(2,Number(ratio)||1));}
function interval(view,menu){return 1000/(view?.paused?15:(menu||view?.inventoryOpen||view?.techTower||view?.attributesOpen||view?.shop||view?.selectedTower||view?.chestDialog||view?.game?.progress?.pendingChestRewards)?30:60);}
function due(now,last,period){return last==null||now<last||now-last>=period-.75;}
const api={pixelRatio,interval,due};if(typeof module!=='undefined')module.exports=api;else globalThis.AlienRenderBudget=api;
})();
