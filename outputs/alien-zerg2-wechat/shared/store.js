(function(){
// Test-only switch: disable before enabling real payments.
const SIMULATED_PAYMENT=true;
const packs=[{name:'一包氪石',price:6,base:60,gift:0},{name:'一袋氪石',price:30,base:300,gift:60},{name:'一箱氪石',price:98,base:980,gift:220}];
function day(now=Date.now()){return new Date(now+8*3600000).toISOString().slice(0,10);}
function available(){return true;}
function buy(s,P,now=Date.now()){
 if(s.kryptonite<100)return '氪石不足，需要 100 氪石';
 let left=50;for(const i of s.inventory){if(!P.isChest(i))continue;const n=Math.min(left,99-i.count);i.count+=n;left-=n;if(!left)break;}
 if(left){const i={id:P.CHEST_ID,uid:s.nextUid++,count:left};s.inventory.push(i);s.overflow.push(i.uid);}
 s.kryptonite-=100;P.fillOverflow(s);P.syncWarehouseMaterials(s);return null;
}
function install(View,P){const p=View.prototype,old={};for(const k of ['managementTabs','switchManagement','closeManagement','draw','down','managementProjection'])old[k]=p[k];
 p.managementTabs=function(){const w=Math.min(150,(this.w-48)/3),x=(this.w-w*3-16)/2,y=this.h-84;return ['vehicle','technology','store'].map((page,i)=>({page,text:['战车装备','防守塔科技','补给站'][i],x:x+i*(w+8),y,w,h:48}));};
 p.switchManagement=function(page){if(page!=='store'){this.storeOpen=false;return old.switchManagement.call(this,page);}old.switchManagement.call(this,'vehicle');this.storeOpen=true;this.storeTab='goods';this.storeMessage='';this.storeConfirm=false;this.storeSimPack=null;this.storeReceipt=null;};
 p.closeManagement=function(){this.storeOpen=false;this.storeConfirm=false;return old.closeManagement.call(this);};
 p.managementProjection=function(){return this.storeOpen?null:old.managementProjection.call(this);};
 p.storeLayout=function(){const w=Math.min(760,this.w-24),h=Math.min(630,this.h-this.top-24),x=(this.w-w)/2,y=this.top+(this.h-this.top-h)/2,wide=w>550;return {x,y,w,h,wide,close:{x:x+w-46,y:y+8,w:38,h:38},tabs:['goods','supply'].map((key,i)=>({key,x:x+16+i*100,y:y+66,w:92,h:38})),cards:(this.storeTab==='supply'?packs:[{}]).map((a,i)=>({x:wide&&this.storeTab!=='supply'?x+(w-(w-56)/3)/2:x+16+(wide?i*(w-32)/3:0),y:y+120+(wide?0:i*108),w:wide?(w-56)/3:w-32,h:wide?h-174:this.storeTab==='supply'?100:210})),confirm:{x:x+w/2+6,y:y+h/2+35,w:Math.min(135,w/2-30),h:42},cancel:{x:x+w/2-Math.min(135,w/2-30)-6,y:y+h/2+35,w:Math.min(135,w/2-30),h:42}};};
 p.drawStore=function(){const c=this.ctx,L=this.storeLayout(),s=this.game.progress,supply=this.storeTab==='supply';c.clearRect(0,0,this.w,this.h);c.fillStyle='#060f18';c.fillRect(0,0,this.w,this.h);this.techPlate(L.x,L.y,L.w,L.h);this.text(supply?'补给站-氪石':'补给站-商店',L.x+18,L.y+33,Math.min(23,(L.w-184)/6.5),'#f5dda3');this.hudImage('kryptonite',L.x+L.w-154,L.y+16,22,22);this.text(String(s.kryptonite),L.x+L.w-124,L.y+34,17,'#ffe3a2');this.text('×',L.close.x+19,L.close.y+26,26,'#bdd5df','center');
 for(const t of L.tabs){this.techPlate(t.x,t.y,t.w,t.h,this.storeTab===t.key?'active':'idle');this.text(t.key==='goods'?'商店':'氪石',t.x+t.w/2,t.y+25,17,this.storeTab===t.key?'#ffe2a2':'#9ab6c4','center');}
 L.cards.forEach((r,i)=>{this.techPlate(r.x,r.y,r.w,r.h);const cx=r.x+r.w/2;
 if(supply){const a=packs[i];if(L.wide){const short=r.h<290;this.hudImage('kryptonite',cx-(short?24:38),r.y+12,short?48:76,short?48:76);this.text(a.name,cx,r.y+(short?83:125),20,'#f1dba4','center');this.text(String(a.base+a.gift)+' 氪石'+(a.gift?'（赠 '+a.gift+'）':''),cx,r.y+(short?108:158),14,'#a8dbcd','center');this.text('¥ '+a.price,cx,r.y+r.h-43,24,'#eff4ec','center');this.text(SIMULATED_PAYMENT?'模拟购买':'暂未开放',cx,r.y+r.h-16,13,'#8b9ca7','center');}else{this.hudImage('kryptonite',r.x+12,r.y+24,48,48);this.text(a.name,r.x+74,r.y+29,18,'#f1dba4');this.text((a.base+a.gift)+' 氪石'+(a.gift?' · 赠 '+a.gift:''),r.x+74,r.y+56,14,'#a8dbcd');this.text('¥ '+a.price,r.x+r.w-18,r.y+34,21,'#eff4ec','right');this.text(SIMULATED_PAYMENT?'模拟购买':'暂未开放',r.x+r.w-18,r.y+78,12,'#8b9ca7','right');}}
 else {const ry=r.y+(L.wide?35:56);this.chestIcon(cx,ry,L.wide?55:88);this.text('物资宝箱 ×50',cx,r.y+(L.wide?82:126),21,'#f3dfa9','center');this.text('不限兑换次数',cx,r.y+(L.wide?104:154),13,'#9bbac8','center');if(!L.wide)this.text('装备 · 枪塔碎片 · 芯元等随机物资',cx,r.y+181,12,'#819daa','center');const b=this.storeBuyRect();this.techPlate(b.x,b.y,b.w,b.h,available(s)&&s.kryptonite>=100?'active':'idle');this.hudImage('kryptonite',b.x+12,b.y+11,22,22);this.text(available(s)?'100 氪石兑换':'今日已兑换',b.x+b.w/2+9,b.y+29,14,available(s)?'#f5dfaa':'#889daa','center');}
 });
 this.text(this.storeMessage||(supply?'模拟支付测试 · 不扣真钱 · 氪石计入当前存档':'不限兑换次数 · 仓库满时自动暂存'),L.x+L.w/2,L.y+L.h-24,Math.min(12,L.w/34),'#9bb8c6','center');
 if(this.storeConfirm||this.storeReceipt){c.fillStyle='#02080de8';c.fillRect(L.x,L.y,L.w,L.h);const y=L.y+L.h/2,a=packs[this.storeSimPack],receipt=this.storeReceipt,title=receipt?'模拟购买成功':a?'模拟购买 · '+a.name:'兑换 50 个物资宝箱？',detail=receipt?'已获得 '+receipt+' 氪石，未扣真钱':a?'标价 ¥'+a.price+' · 获得 '+(a.base+a.gift)+' 氪石':'消耗 100 氪石 · 可重复兑换';this.text(title,L.x+L.w/2,y-45,20,'#ffe1a2','center');this.text(detail,L.x+L.w/2,y-14,14,'#b7cbd4','center');if(a&&!receipt)this.text('仅模拟支付，不扣真钱',L.x+L.w/2,y+12,14,'#ffe1a2','center');for(const [b,t]of receipt?[[L.confirm,'完成']]:[[L.cancel,'取消'],[L.confirm,a?'确认模拟购买':'确认兑换']]){this.techPlate(b.x,b.y,b.w,b.h,t==='取消'?'idle':'active');this.text(t,b.x+b.w/2,b.y+28,16,'#f5dda3','center');}}

 };
 p.storeBuyRect=function(){const L=this.storeLayout(),r=L.cards[0];return L.wide?{x:r.x+12,y:r.y+r.h-64,w:r.w-24,h:44}:{x:r.x,y:r.y+r.h+18,w:r.w,h:46};};
 p.draw=function(){if(this.storeOpen)return this.drawStore();return old.draw.call(this);};
 p.down=function(id,x,y){if(!this.storeOpen)return old.down.call(this,id,x,y);const L=this.storeLayout(),hit=r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
 if(this.storeReceipt){if(hit(L.confirm)){this.storeReceipt=null;this.storeSimPack=null;}return;}
 if(this.storeConfirm){if(hit(L.cancel)){this.storeConfirm=false;this.storeSimPack=null;}else if(hit(L.confirm)){const a=packs[this.storeSimPack];if(a&&SIMULATED_PAYMENT){const amount=a.base+a.gift;this.game.progress.kryptonite+=amount;this.storeReceipt=amount;this.storeMessage='模拟购买成功 · 获得 '+amount+' 氪石';this.game.progressDirty=true;this.flushSave(true);}else if(!a){const error=buy(this.game.progress,P);this.storeMessage=error||'兑换成功 · 50 个物资宝箱已入仓';if(!error){this.game.progressDirty=true;this.flushSave(true);}}this.storeConfirm=false;}return;}
 if(this.storeTab==='supply'&&SIMULATED_PAYMENT){const i=L.cards.findIndex(hit);if(i>=0){this.storeSimPack=i;this.storeConfirm=true;return;}}

 if(hit(L.close)){this.storeOpen=false;return;}const tab=L.tabs.find(hit);if(tab){this.storeTab=tab.key;this.storeMessage='';return;}if(this.storeTab==='goods'&&hit(this.storeBuyRect())){const s=this.game.progress;this.storeMessage=!available(s)?'今日已兑换，明日再来':s.kryptonite<100?'氪石不足，需要 100 氪石':'';if(!this.storeMessage)this.storeConfirm=true;}
 };
}
const api={packs,day,available,buy,install};if(typeof module!=='undefined')module.exports=api;else globalThis.AlienStore=api;
})();
