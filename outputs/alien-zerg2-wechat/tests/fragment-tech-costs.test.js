const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared'])test(root+' research uses corresponding fragments and chips, never kryptonite',()=>{
 const P=require(root+'/progression'),{Game}=require(root+'/core');
 for(const id of P.towerIds)for(let branch=0;branch<P.towerTech[id].branches.length;branch++)for(let spec=0;spec<2;spec++){
 const s=P.fresh(),key=`${id}:${branch}:${spec}`;s.operators[`${id}:${branch}`]=true;s.kryptonite=0;const g=new Game({progress:s});
 for(let rank=0;rank<5;rank++){
 const cost=P.fragmentCosts[rank],chips=P.chipCosts[rank];g.progress.fragments[key]=cost-1;g.progress.chips=chips;
 assert.equal(g.upgradeTower(id,branch,spec),false);assert.equal(g.progress.chips,chips);
 g.progress.fragments[key]=cost;g.progress.chips=chips-1;assert.equal(g.upgradeTower(id,branch,spec),false);assert.equal(g.progress.fragments[key],cost);
 g.progress.chips=chips;assert.equal(g.upgradeTower(id,branch,spec),true);assert.equal(g.progress.fragments[key],0);assert.equal(g.progress.chips,0);assert.equal(g.progress.kryptonite,0);
 }assert.equal(g.upgradeTower(id,branch,spec),false);
 }
 const s=P.fresh();s.chips=99999;s.fragments[P.fragmentKeys[0]]=999;const g=new Game({progress:s});assert.equal(g.upgradeTower(12200,0,0),false);
});
