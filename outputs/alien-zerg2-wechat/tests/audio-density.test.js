const test=require('node:test'),assert=require('node:assert/strict');const {View}=require('../shared/view');
test('music stays off and crowded effects are reduced without delayed queues',()=>{
 const v=new View({}, {},390,844),played=[];v.onSound=e=>played.push(e);v.game.update=()=>{};v.game.state='playing';
 for(let i=0;i<60;i++){v.game.events.push('gun','gun','fire','laser','sword');v.step(1/60);}
 assert.equal(played.includes('musicStart'),false);assert.ok(played.filter(e=>e==='gun').length<=7);assert.ok(played.filter(e=>e!=='musicPause').length<=24);
 played.length=0;for(let i=0;i<30;i++)v.step(1/60);assert.equal(played.length,0);
});
