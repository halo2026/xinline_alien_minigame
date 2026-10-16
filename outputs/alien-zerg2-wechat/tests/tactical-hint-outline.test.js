const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared'])test(root+' native four-frame outline only highlights each unused ready card',()=>{
 const {View}=require(root+'/view'),A=require(root+'/art-data'),v=new View({}, {pages:[]},390,844),drawn=[];
 v.sprite=(...a)=>drawn.push(a);v.grayCardSprite=()=>{};v.text=()=>{};v.tacticalLayout=()=>[{id:12013,x:50,y:100,size:46}];v.game.cards[12013]={count:2,ready:0};v.game.time=1;v.game.progress.tacticalIntroSeen=[];
 for(let i=0;i<4;i++){drawn.length=0;v.uiEffectTime=i*.12+.001;v.drawTacticalHUD();assert.equal(drawn.at(-1)[0],'tactical-hint/'+i);const f=A.frames[drawn.at(-1)[0]];assert.equal(A.pages[f.page],'tactical-hint.png');assert.equal(f.w,82);}
 v.game.progress.tacticalIntroSeen=[12013];drawn.length=0;v.drawTacticalHUD();assert.equal(drawn.length,1);
 v.game.progress.tacticalIntroSeen=[];v.game.cards[12013].ready=2;drawn.length=0;v.drawTacticalHUD();assert.equal(drawn.length,0);
});
