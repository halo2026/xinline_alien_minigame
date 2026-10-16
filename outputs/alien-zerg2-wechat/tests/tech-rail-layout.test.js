const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared']){
 const {View}=require(root+'/view'),P=require(root+'/progression');
 test(root+' all tower families fit without scrolling and rail/upgrade taps match scaled rendering',()=>{
 for(const [w,h,top,projected] of [[390,844,98],[390,667,98],[320,568,44],[420,840,0,true]]){
 const v=new View({}, {},w,h,top);v._projected=!!projected;v.game.progress.battleIntroStep=3;v.game.progress.resourceIntroStep=5;v.insertionBlocksInput=()=>false;
 for(const id of P.towerIds)for(let branch=0;branch<P.towerTech[id].branches.length;branch++){
 v.techTower=id;v.techBranch=branch;v.techConfirm={family:id,branch,base:true};const L=v.towerTechLayout();assert.equal(L.maxScroll,0);
 for(const n of L.nodes){assert(n.upgrade.y+n.upgrade.h<=L.viewport.y+L.viewport.h);assert(n.hit.x>=L.viewport.x-1);assert(n.hit.x+n.hit.w<=L.viewport.x+L.viewport.w+1);const x=n.upgrade.x+n.upgrade.w/2,y=n.upgrade.y+n.upgrade.h/2;v.down(1,x,y);v.up(1,x,y);assert.equal(v.techUpgradeConfirm.spec,n.spec);assert.equal(v.techUpgradeConfirm.branch,branch);v.techUpgradeConfirm=null;}
 const tree=L.tree;assert(tree.nodes[0].y-6>tree.weapons[branch].y+tree.weapons[branch].h+31);
 for(const tab of L.tabs){assert(tab.x>L.viewport.x+L.viewport.w);v.down(1,tab.x+tab.w/2,tab.y+25);v.up(1,tab.x+tab.w/2,tab.y+25);assert.equal(v.techTower,tab.id);}
 }
 }
 });
}
