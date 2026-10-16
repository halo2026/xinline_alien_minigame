const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared']){
 const {Game}=require(root+'/core');
 function open(sequence,count=1,owned=false){const g=new Game();g.progress.pendingChestRewards=null;if(owned)for(const k in g.progress.operators)g.progress.operators[k]=true;sequence=[...sequence];g.random=()=>{assert(sequence.length,'unexpected random draw');return sequence.shift();};const before=g.progress.chips,r=g.openChests(count);assert.equal(sequence.length,0);return {r,delta:g.progress.chips-before};}
 test(root+' chip rewards are 5-20 per chest, including duplicate operator fallback',()=>{assert.equal(open([0,.5,0]).delta,5);assert.equal(open([0,.5,.9999]).delta,20);assert.equal(open([.99,.5,.9999,.6,.7]).delta,20);assert.equal(open(Array.from({length:10},()=>[0,.5,.9999]).flat(),10).delta,200);assert.equal(open([0,.02,0,.5,0],1,true).delta,5);});
 test(root+' fragment quantity and reward probability boundaries remain unchanged',()=>{assert.equal(open([0,.2724,0]).r.rewards[0].count,5);assert.equal(open([0,.2725,0]).r.rewards[0].kind,'chips');assert.equal(open([0,.85]).r.rewards[0].kind,'kryptonite');assert.equal(open([0,.02,0]).r.rewards[0].kind,'operator');assert.equal(open([0,.02,0,.49,0],1,true).r.rewards[0].count,5);});
}
