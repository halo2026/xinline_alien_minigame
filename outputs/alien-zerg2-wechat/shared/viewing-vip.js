(function(){
// Fill in the real rewarded-video placement before enabling purchases.
const config={adUnitId:''};
const thresholds=[1,10,25,50,80,120,180,260,360,500];
const levels=thresholds.map((views,i)=>({level:i+1,views,fragments:[10,30,50,80,120,160,220,300,400,600][i],gold:[1,1,2,2,3,3,4,4,5,6][i],red:i<5?0:[1,1,2,2,3][i-5]}));
const integer=n=>Number.isSafeInteger(n)&&n>=0?n:0;
function restore(raw){const views=integer(raw?.views);return {views,tickets:integer(raw?.tickets),claimed:[...new Set((Array.isArray(raw?.claimed)?raw.claimed:[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=10&&views>=thresholds[n-1]))]};}
function state(s){return s.viewingVip||(s.viewingVip=restore());}
function level(s){return levels.filter(l=>state(s).views>=l.views).length;}
function available(wxApi=globalThis.wx){return /^adunit-.+/.test(config.adUnitId)&&typeof wxApi?.createRewardedVideoAd==='function';}
function buy(s,wxApi){if(!available(wxApi))return '广告暂未开放，暂不扣除芯元';if(s.chips<100)return '芯元不足，需要 100 芯元';s.chips-=100;state(s).tickets++;return null;}
function grant(s,P,reward,random=Math.random){
 const rewards=[];for(let n=0;n<(reward.fragments||0);n++){const key=P.fragmentKeys[Math.min(P.fragmentKeys.length-1,Math.floor(random()*P.fragmentKeys.length))];s.fragments[key]=(s.fragments[key]||0)+1;}
 if(reward.fragments)rewards.push('随机科技碎片 ×'+reward.fragments);
 for(const [kind,quality]of [['gold',3],['red',5]]){const ids=Object.keys(P.catalog).map(Number).filter(id=>P.equipmentQualities[id]===quality);for(let n=0;n<(reward[kind]||0);n++){const id=ids[Math.min(ids.length-1,Math.floor(random()*ids.length))],item=P.createEquipment(id,s.nextUid++,random);s.inventory.push(item);s.overflow.push(item.uid);}if(reward[kind])rewards.push((quality===5?'红色':'金色')+'装备 ×'+reward[kind]);}
 P.fillOverflow(s);return rewards.join(' · ');
}
function claim(s,P,n,random){const v=state(s),r=levels[n-1];if(!r||v.views<r.views)return {error:'尚未达到该等级'};if(v.claimed.includes(n))return {error:'该等级奖励已领取'};const message=grant(s,P,r,random);v.claimed.push(n);return {message};}
let busy=false;
function isBusy(){return busy;}
// A single session owns its callbacks. Neither cancellation nor load errors consume a ticket.
function watch(s,P,{wxApi=globalThis.wx,save=()=>{},valid=()=>true,random=Math.random}={}){
 if(busy)return Promise.resolve({error:'广告正在播放，请稍候'});
 if(!available(wxApi))return Promise.resolve({error:'广告暂未开放，暂不扣除芯元'});
 if(state(s).tickets<1)return Promise.resolve({error:'请先购买观影券'});
 busy=true;
 return new Promise(resolve=>{let ad,finished=false;
 const finish=(result)=>{if(finished)return;finished=true;busy=false;if(ad){ad.offClose?.(close);ad.offError?.(error);ad.destroy?.();}resolve(result);};
 const error=()=>finish({error:'广告加载失败，观影券已保留'});
 const close=res=>{if(finished)return;if(!res?.isEnded)return finish({error:'未完整观看，观影券已保留'});if(!valid()||state(s).tickets<1)return finish({error:'存档已切换，本次未计入'});state(s).tickets--;state(s).views++;const message=grant(s,P,{fragments:3},random);try{save();}catch(e){return finish({error:'奖励已获得，存档待重试'});}finish({message:'观影完成 · '+message});};
 try{ad=wxApi.createRewardedVideoAd({adUnitId:config.adUnitId});ad.onClose(close);ad.onError(error);Promise.resolve(ad.show()).catch(()=>{if(!finished)return Promise.resolve(ad.load()).then(()=>{if(!finished)return ad.show();});}).catch(error);}catch(e){error();}
 });
}
const api={config,levels,restore,state,level,available,buy,claim,watch,isBusy};if(typeof module!=='undefined')module.exports=api;else globalThis.ViewingVip=api;
})();
