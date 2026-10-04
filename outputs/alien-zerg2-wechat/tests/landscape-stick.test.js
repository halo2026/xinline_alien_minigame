const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared'])test(root+' enlarged landscape movement accepts lower-left and 55 percent width',()=>{
const {View}=require(root+'/view'),v=new View({}, {},844,390,6);v.resize(844,390,6);v.game.start();
for(const [x,y] of [[70,370],[460,170]]){v.down(1,x,y);assert.equal(v.touchIds[1],'move');v.motion(1,x+20,y);assert(v.game.move.x>0);v.up(1);}
const b=v.buildButtonLayout();v.down(2,b.x+b.w/2,b.y+b.h/2);assert(v.shop);assert.equal(v.touchIds[2],undefined);
});
