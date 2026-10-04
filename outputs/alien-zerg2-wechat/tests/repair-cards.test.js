const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared'])test(root+' repair blocks cards without consuming counts or cooldown, then restores use',()=>{
const {Game}=require(root+'/core'),g=new Game();g.start();g.takeCard(12015);
g.player.hp=0;g.player.respawn=10;const before=JSON.stringify(g.cards);assert.equal(g.useCard(12015),false);assert.equal(JSON.stringify(g.cards),before);assert.equal(g.cardCasts.length,0);
g.player.hp=100;assert.equal(g.useCard(12015),false);assert.equal(JSON.stringify(g.cards),before);
g.player.respawn=0;assert.equal(g.useCard(12015),true);assert.equal(g.cards[12015].count,0);
});
