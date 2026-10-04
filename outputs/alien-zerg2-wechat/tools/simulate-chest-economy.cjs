// Isolated seeded simulations. Never reads or writes a player's save.
const fs=require('node:fs'),path=require('node:path'),{Game}=require('../shared/core'),P=require('../shared/progression');
const trials=Number(process.env.TRIALS)||3000,output={trials,operatorTypes:P.operatorKeys.length,fragmentTypes:P.fragmentKeys.length,fragmentCosts:P.fragmentCosts,chipCosts:P.chipCosts,scenarios:[]};
function summarize(a){a.sort((x,y)=>x-y);return {mean:a.reduce((s,n)=>s+n,0)/a.length,p10:a[Math.floor(a.length*.1)],median:a[Math.floor(a.length*.5)],p90:a[Math.floor(a.length*.9)]};}
for(const [profile,count,batch] of [['new',20,10],['new',30,10],['new',50,10],['new',100,10],['new',300,10],['new',100,1],['new',300,1],['all',100,10],['all',300,10]]){
 const rows=[];for(let i=0;i<trials;i++){
  const g=new Game({seed:((i+1)*2654435761)>>>0}),s=g.progress;s.level=5;g.claimFirstTechnologyGift();s.pendingTechnologyGift=false;if(profile==='all')for(const k of P.operatorKeys)s.operators[k]=true;
  const beforeOps=Object.values(s.operators).filter(Boolean).length;
  if(!g.collectChest({count}))throw Error('stock failed');
  let gear=0,red=0,usableGear=0;
  for(let j=0;j<count;j+=batch){const result=g.openChests(Math.min(batch,count-j));if(!result)throw Error('open failed');for(const r of result.rewards)if(r.kind==='gear'){gear+=r.count;if(P.equipmentQualities[r.id]===5)red+=r.count;if(r.requiredLevel<=s.level)usableGear+=r.count;}g.acknowledgeChestRewards();}
  const row={operators:Object.values(s.operators).filter(Boolean).length-beforeOps,fragments:Object.values(s.fragments).reduce((a,b)=>a+b,0),chips:s.chips,kryptonite:s.kryptonite,gear,red,usableGear,allUnlocked:Object.values(s.operators).filter(Boolean).length===P.operatorKeys.length?1:0};
  // Breadth-first research from zero; shared chips are actually spent, no double counting.
  let upgrades=0,maxRank=0;for(let rank=0;rank<5;rank++)for(const key of P.fragmentKeys){const [family,branch,spec]=key.split(':').map(Number);if(s.towerPaths[family][branch][spec]!==rank)continue;if(g.upgradeTower(family,branch,spec)){upgrades++;maxRank=Math.max(maxRank,rank+1);}}
  row.researchUpgrades=upgrades;row.maxResearchRank=maxRank;rows.push(row);
 }
 const stats=Object.fromEntries(Object.keys(rows[0]).map(k=>[k,summarize(rows.map(r=>r[k]))]));output.scenarios.push({profile,count,batch,stats});console.error(profile,count,batch,'done');
}
const out=path.join(__dirname,'../audits/chest-economy/simulation-20260920.json');fs.writeFileSync(out,JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
