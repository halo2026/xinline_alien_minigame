(function(){
const definitions=[
 ['attack','攻击','',[[10,20],[25,40],[45,65],[70,100]]],
 ['haste','射速','%',[[1,2],[3,4],[5,6],[7,10]]],
 ['hp','生命','',[[50,100],[120,200],[220,350],[400,600]]],
 ['crit','暴击','%',[[10,20],[25,40],[45,70],[80,100]]],
 ['armor','护甲','',[[1,2],[3,5],[6,8],[9,12]]],
 ['move','移动','',[[3,5],[6,10],[11,15],[16,22]]],
 ['repair','修复','ms',[[100,200],[250,400],[450,700],[750,1000]]],
 ['wheel','轮刀','/秒',[[20,40],[50,80],[90,130],[140,200]]],
 ['grenade','榴弹威力','',[[30,60],[70,120],[130,200],[220,320]]],
 ['cooldown','榴弹冷却','ms',[[20,40],[50,70],[80,100],[110,150]]]
];
const keys=definitions.map(d=>d[0]),defs=Object.fromEntries(definitions.map(d=>[d[0],{key:d[0],name:d[1],unit:d[2],ranges:d[3]}])),colors=['#dae2e9','#77ccff','#ffe08a','#ff837e'],names=['白','蓝','金','红'];
const validRandom=r=>Math.max(0,Math.min(.999999999,Number(r())||0));
function holes(tier,random=Math.random){const r=validRandom(random);return tier===4?(r<.45?1:r<.95?2:3):0;}
function initialize(item,tier,random=Math.random){return {...item,socketVersion:1,sockets:Array.from({length:holes(tier,random)},()=>null)};}
function unlocks(raw){return Object.fromEntries(keys.map(k=>[k,raw?.[k]===true]));}
function restore(item,tier,unlocked){
 if(item.socketVersion!==1){let seed=(Number(item.uid)*1664525+Number(item.id)*1013904223)>>>0;return initialize(item,tier,()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;});}
 const n=tier===4?Math.max(1,Math.min(3,(Array.isArray(item.sockets)?item.sockets.length:0)||1)):tier===3?Math.min(2,(Array.isArray(item.sockets)?item.sockets.length:0)||0):0;
 const restored={...item,socketVersion:1,sockets:Array.from({length:n},(_,i)=>{const a=item.sockets?.[i],d=defs[a?.key],range=d?.ranges[a?.quality-1];if(!range||!Number.isInteger(a.value)||a.value<range[0]||a.value>range[1]||a.quality===4&&!unlocked[a.key])return null;return {key:a.key,quality:a.quality,value:a.value,locked:a.locked===true};}).map((a,i,arr)=>a?.locked&&arr.slice(0,i).filter(x=>x?.locked).length>=n-1?{...a,locked:false}:a)};
 if(tier!==4)return {...restored,fusionTech:inherited({fusionTech:itemBonus(restored)}),sockets:[]};return restored;
}
function roll(unlocked,random,gold={}){const key=keys[Math.floor(validRandom(random)*keys.length)],weights=[55,30,gold[key]?13:0,unlocked[key]?2:0],total=weights.reduce((a,b)=>a+b),r=validRandom(random)*total;let quality=1,sum=0;for(let i=0;i<4;i++){sum+=weights[i];if(r<sum){quality=i+1;break;}}const [lo,hi]=defs[key].ranges[quality-1];return {key,quality,value:lo+Math.floor(validRandom(random)*(hi-lo+1)),locked:false};}
function cost(item){const n=item?.sockets?.length||0,locked=item?.sockets?.filter(a=>a?.locked).length||0;return {chips:n*50,kryptonite:[0,20,120][locked]??Infinity,locked,count:n};}
function inherited(item){return Object.fromEntries(keys.filter(k=>Number.isFinite(item?.fusionTech?.[k])&&item.fusionTech[k]>0).map(k=>[k,Math.min(1e9,item.fusionTech[k])]));}
function itemBonus(item){const out=inherited(item),rolled={};for(const a of item?.sockets||[])if(a&&defs[a.key])rolled[a.key]=(rolled[a.key]||0)+a.value;for(const k of keys)out[k]=Math.max(out[k]||0,rolled[k]||0);return out;}
function bonus(s){const out=Object.fromEntries(keys.map(k=>[k,0]));for(const uid of new Set(s.equipped))for(const [k,v]of Object.entries(itemBonus(s.inventory.find(i=>i.uid===uid))))out[k]+=v;return out;}
function value(a){const d=defs[a.key];return (['repair','cooldown'].includes(a.key)?'−':'+')+(a.key==='crit'?Math.round(a.value)/100:Math.round(a.value*100)/100)+d.unit;}
function installGame(Game,P){const p=Game.prototype,apply=p.applyEquipment;
 p.applyEquipment=function(full=false){apply.call(this,full);const u=this.player,b=bonus(this.progress),ratio=u.hp/u.maxHp;u.attack+=b.attack;u.attackMultiplier+=b.attack/500;u.maxHp+=b.hp;u.hp=full?u.maxHp:ratio*u.maxHp;u.fireRate*=1+b.haste/100;u.critChance=Math.min(.65,u.critChance+b.crit/10000);u.armor+=b.armor;u.baseArmor=u.armor;u.speed+=b.move;u.repairTime=Math.max(5,u.repairTime-b.repair/1000);u.wheelDamage+=b.wheel;u.grenadeBonus+=b.grenade;u.baseStats.grenadeBonus=0;u.baseStats.grenadeCooldown=1.5-(P.vehicleSkins[this.progress.vehicleSkin]?.grenadeCooldownReduction||0);u.grenadeCooldown=Math.max(.3,u.baseStats.grenadeCooldown-b.cooldown/1000);};
 p.toggleSocketLock=function(uid,index){const item=this.progress.inventory.find(i=>i.uid===uid),a=item?.sockets?.[index],c=cost(item);if(P.catalog[item?.id]?.tier!==4){this.gearError='仅红装可以锻造';return false;}if(!a||!Number.isInteger(index)){this.gearError='先生成科技后才能锁定';return false;}if(!a.locked&&c.locked>=c.count-1){this.gearError='至少保留一个孔用于随机强化';return false;}a.locked=!a.locked;this.gearError='';this.progressDirty=true;return true;};
 p.reforgeSockets=function(uid){const s=this.progress,item=s.inventory.find(i=>i.uid===uid),c=cost(item);if(P.catalog[item?.id]?.tier!==4){this.gearError='仅红装可以锻造';return false;}if(!c.count||c.locked>=c.count){this.gearError='没有可强化的孔';return false;}if(s.chips<c.chips||s.kryptonite<c.kryptonite){this.gearError=s.chips<c.chips?'芯元不足':'氪石不足';return false;}const next=item.sockets.map(a=>a?.locked?{...a}:roll(s.redEquipmentTech||{},()=>this.random(),s.goldEquipmentTech||{}));s.chips-=c.chips;s.kryptonite-=c.kryptonite;item.sockets=next;this.applyEquipment();P.syncWarehouseMaterials(s);this.progressDirty=true;this.gearError='强化完成，未锁定的科技已更新';this.events.push('build');return true;};
}

// A branch owns one item; base towers deliberately have no equipment slot.
function towerRules(P,item,key){const [id,b]=String(key).split(':').map(Number),mode=P.towerModes[id]?.[b],base=P.catalog[item?.id],g=base?{...base,stats:P.equipmentStats(item)}:null,out={};if(!mode||!['antiair','satellite'].includes(g?.kind))return out;
 const artillery=id===12205;
 for(const [key,value]of Object.entries(itemBonus(item)))if(['attack','haste','crit','wheel'].includes(key)||artillery&&['grenade','cooldown'].includes(key))out[key]=value;
 if(g.kind==='spikes')out.wheel=(out.wheel||0)+g.stats.melee_fight;
 if(g.kind==='loader'&&artillery)out.grenade=(out.grenade||0)+g.stats.throw_atk;
 if(g.kind==='antiair')out.antiair=g;
 if(g.kind==='satellite')out.satellite=g;
 if(g.kind==='repair')out.repair=g.stats.repair_rate;
 if(g.kind==='fire'&&mode==='flame')out.fire=g.stats.trail_dps;
 return out;
}
function towerCompatible(P,item,key){return Object.keys(towerRules(P,item,key)).length>0;}
function towerDescription(P,item){const names=P.operatorKeys.filter(k=>towerCompatible(P,item,k)).map(k=>{const [id,b]=k.split(':');return P.towerTech[id].branches[b][0];});return names.length?'枪塔适配：'+(names.length===P.operatorKeys.length?'全部操作员枪塔':names.join('、'))+'。仅适配技能和属性生效。':'枪塔适配：不可装配，防守塔支持防空装置、精灵卫星。';}
function installTowerGame(Game,P,D){const p=Game.prototype;
 // Derive hints from the same ownership, storage, level and compatibility rules as equipTowerGear.
 p.towerGearReadyKeys=function(){const s=this.progress,used=new Set([...(s.equipped||[]),...Object.values(s.towerEquipment||{})]),stored=new Set([...(s.warehouse||[]),...(s.overflow||[])]),items=s.inventory.filter(i=>stored.has(i.uid)&&!used.has(i.uid)&&P.requiredLevel(i)<=s.level),ready=new Set();for(const key of P.operatorKeys)if(s.operators[key]&&s.towerEquipment?.[key]==null&&items.some(i=>towerCompatible(P,i,key)))ready.add(key);return ready;};
 p.hasTowerGearReady=function(family=null,branch=null){return [...this.towerGearReadyKeys()].some(key=>{const [id,b]=key.split(':').map(Number);return (family==null||id===family)&&(branch==null||b===branch);});};
 p.towerGear=function(t){if(!t||t.techBranch==null)return {};const key=t.id+':'+t.techBranch,uid=this.progress.towerEquipment?.[key];if(t._gearCache&&t._gearCache.uid===uid&&t._gearCache.key===key)return t._gearCache.rules;const item=uid==null?null:this.progress.inventory.find(i=>i.uid===uid),rules=towerRules(P,item,key);t._gearCache={key,uid,rules};return rules;};
 p.equipTowerGear=function(key,uid){const s=this.progress,item=s.inventory.find(i=>i.uid===uid);s.towerEquipment??={};if(!P.operatorKeys.includes(key)||!s.operators[key]){this.gearError='请先获得这位操作员';return false;}if(uid!=null&&(!item||!towerCompatible(P,item,key)||P.requiredLevel(item)>s.level||s.equipped.includes(uid)||Object.values(s.towerEquipment).includes(uid)||![...s.warehouse,...s.overflow].includes(uid))){this.gearError='装备不适配、等级不足或已被使用';return false;}delete s.towerEquipment[key];if(uid!=null)s.towerEquipment[key]=uid;P.syncWarehouseMaterials(s);this.progressDirty=true;this.gearError='';return true;};
 for(const name of ['dropGear','salvageGear','reforgeSockets']){const run=p[name];p[name]=function(uid,...args){if(Object.values(this.progress.towerEquipment||{}).includes(uid)){this.gearError='请先从枪塔卸下这件装备';return false;}return run.call(this,uid,...args);};}
 const stats=p.towerStats;p.towerStats=function(t){const a={...stats.call(this,t)},b=this.towerGear(t),star=t&&t.techBranch!=null&&this.progress.operators?.[t.id+':'+t.techBranch]?P.operatorStar(this.progress,t.id+':'+t.techBranch):1,mult=1+Math.max(0,star-1)*.1;a.damage*=mult;a.range*=mult;const base={machine:200,shotgun:200,sniper:500,flame:300,frost:200,chain:400,cannon:800,howitzer:800,rocket:800,shrink:200,wave:260}[a.mode]||300;a.damage+=(b.attack||0)/base+(b.grenade||0)/800;a.interval=Math.max(.08,(a.interval-(b.cooldown||0)/1000)/(1+(b.haste||0)/100))/mult;if(this._towerCritical===t)a.damage*=2;return a;};
 for(const name of ['fire','fireFlame','towerRay']){const run=p[name];p[name]=function(from,...args){const prev=this._towerCritical;if(prev!==from&&this.towerGear(from).crit>0&&this.random()<this.towerGear(from).crit/10000)this._towerCritical=from;try{return run.call(this,from,...args);}finally{this._towerCritical=prev;}};}
 const artillery=p.fireArtillery;p.fireArtillery=function(from,target,tech){if(this.towerGear(from).crit>0&&this.random()<this.towerGear(from).crit/10000)tech={...tech,damage:tech.damage*2};return artillery.call(this,from,target,tech);};
 const update=p.updateEquipmentEffects;p.updateEquipmentEffects=function(dt){update.call(this,dt);if(this.cleanup)return;for(const t of this.towers){if(t.life<=0)continue;const b=this.towerGear(t);if(!Object.keys(b).length)continue;
 t.gearTick=(t.gearTick||0)+dt;if(t.gearTick>=.25){const elapsed=t.gearTick;t.gearTick=0;let slash=false;for(const e of this.enemies){if(e.hp<=0||e.air||e.hidden||e.chest||Math.hypot(e.x-t.x,e.y-t.y)>100)continue;if(b.wheel){this.damage(e,b.wheel*elapsed,'wheel');slash=true;}if(b.fire){e.gearBurnUntil=this.time+2;e.gearBurnDps=Math.max(e.gearBurnDps||0,b.fire);}}if(slash)this.gearSlashes.push({x:t.x,y:t.y,angle:t.angle||0,born:this.time});}
 if(b.repair){const targets=new Set([...(D.campaign?.exitPoint||D.campaignConfig?.convoy?[]:[this.refinery]),...(this.buildings||[])]);for(const a of targets)if(a&&!a.enemy&&a.hp>0&&Number.isFinite(a.maxHp)&&a.hp<a.maxHp&&Math.hypot(a.x-t.x,a.y-t.y)<=180){a.hp=Math.min(a.maxHp,a.hp+b.repair*dt);if(!this.gearRepairs.includes(a))this.gearRepairs.push(a);}}
 if(b.antiair){t.gearAirCd=(t.gearAirCd??10)-dt;if(t.gearAirCd<=1e-8&&!t.gearSalvo){t.gearSalvo={left:[1,2,4,6][b.antiair.tier-1],next:this.time};t.gearAirCd=10;}const q=t.gearSalvo;if(q&&this.time+1e-8>=q.next){const e=this.nearest(t,1000,e=>e.air&&!e.hidden&&!e.chest);if(e){this.gearMissiles.push({x:t.x,y:t.y-20,angle:t.angle||0,target:e,point:{x:e.x,y:e.y},damage:Math.max(b.antiair.stats.air_damage,[12509,12516].includes(e.id)&&!e.boss?e.maxHp*(b.antiair.tier===4?1:.5):0),speed:430,age:0,trail:[]});this.events.push('throw');}q.left--;q.next=this.time+.2;if(!q.left||!e)t.gearSalvo=null;}}else t.gearSalvo=null;
 }};
}
const api={inherited,itemBonus,towerRules,towerCompatible,towerDescription,installTowerGame,definitions,defs,keys,colors,names,holes,initialize,restore,unlocks,roll,cost,bonus,value,installGame};if(typeof module!=='undefined')module.exports=api;else globalThis.SocketTech=api;
})();
