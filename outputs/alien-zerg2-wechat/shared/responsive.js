(function(){
function install(View,D){const proto=View.prototype,original={draw:proto.draw,down:proto.down,motion:proto.motion,up:proto.up};
proto.resize=function(w,h,top=0){for(const id of Object.keys(this.touchIds))original.up.call(this,id,undefined,undefined,true);this.repairPan=null;this.gearDrag=null;this.techDrag=null;this.selectedPad=null;this.selectedTower=null;this.buildPoint=null;this.game.buildSelected=null;this.game.move={x:0,y:0};this.game.aim=null;this.game.player.vx=0;this.game.player.vy=0;this.keys={};this.w=w;this.h=h;this.top=top;this.landscape=w>h;this.zoom=this.landscape?.57:Math.max(.527,(h-70)/D.size[1]);this.resetSticks();this.updateCamera();};
const followCamera=proto.updateCamera;
proto.updateCamera=function(){
 if(this.game.player.hp<=0&&this.game.state==='playing'){
  if(!this.repairCamera){followCamera.call(this);this.repairCamera={...this.camera};}
  const clamp=(n,size,span)=>span>=size?size/2:Math.max(span/2,Math.min(size-span/2,n));
  this.camera.x=clamp(this.repairCamera.x,D.size[0],this.w/this.zoom);
  this.camera.y=clamp(this.repairCamera.y,D.size[1],this.h/this.zoom);
  this.repairCamera={...this.camera};return;
 }
 this.repairCamera=null;this.repairPan=null;followCamera.call(this);
};
proto.repairMapHit=function(x,y){
 if(this.game.player.hp>0||this.game.state!=='playing'||this.paused||this.inventoryOpen||this.techTower||this.shop||this.attributesOpen||this.chestDialog||this.game.progress.pendingChestRewards||this.selectedTower||this.selectedPad||this.game.buildSelected)return false;
 const hit=r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
 const g=this.grenadeLayout();
 return y>this.top+40&&y<this.vehicleHUDLayout().y&&!hit(this.buildButtonLayout())&&Math.hypot(x-g.x,y-g.y)>g.radius+8&&!this.tacticalLayout().some(r=>Math.abs(x-r.x)<r.size/2+4&&Math.abs(y-r.y)<r.size/2+4);
};
proto.resetSticks=function(){this.sticks={move:{x:this.w>this.h?96:78,y:this.h-(this.w>this.h?94:165)},aim:{x:this.w-78,y:this.h-145}};};
proto.managementProjection=function(){if(this.game.progress.pendingChestRewards&&this.chestAnimationAge>=1.5&&!this.currentChestReveal())return null;if(this.selectedGear&&!this.fusion)return null;if(this.w<=this.h||this._projected||(this.shop&&!this.techTower&&!this.inventoryOpen))return null;const main=this.inventoryOpen||this.techTower||this.shop||this.attributesOpen;if(!main&&!this.chestDialog&&!this.game.progress.pendingChestRewards)return null;const modal=this.warehouseUnlock||this.selectedGear||this.attributeConfirm||this.techUpgradeConfirm||this.chestDialog||this.game.progress.pendingChestRewards;const virtualH=this.inventoryOpen||this.techTower?840:760,split=this.shop?400:420,available=this.h-this.top-12;
 if(modal){const R=this.inProjection({virtualH},()=>this.warehouseUnlock?this.warehouseUnlockLayout():this.attributeConfirm?this.attributeConfirmLayout():this.techUpgradeConfirm?this.techUpgradeLayout():this.selectedGear?this.gearDetailLayout():this.chestDialog&&!this.game.progress.pendingChestRewards?this.chestDialogLayout():{y:0,h:virtualH}),scale=Math.min(1,available/R.h);return {virtualH,scale,segments:[{x:(this.w-420*scale)/2,y:this.top+6+(available-R.h*scale)/2,start:R.y,height:R.h}]};}
 const scale=Math.min(1,available/split,(this.w-36)/840),width=420*scale,total=width*2+16,left=(this.w-total)/2;return {virtualH,scale,segments:[{x:left,y:this.top+6,start:0,height:split},{x:left+width+16,y:this.top+6,start:split,height:split}]};};
proto.inProjection=function(layout,fn){const prev={w:this.w,h:this.h,top:this.top};this._projected=true;this.w=420;this.h=layout.virtualH;this.top=0;try{return fn();}finally{Object.assign(this,prev);this._projected=false;}};
proto.draw=function(){const layout=this.managementProjection();if(!layout)return original.draw.call(this);const c=this.ctx;c.fillStyle='#07121a';c.fillRect(0,0,this.w,this.h);for(const r of layout.segments){c.save();c.beginPath();c.rect(r.x,r.y,420*layout.scale,r.height*layout.scale);c.clip();c.translate(r.x,r.y-r.start*layout.scale);c.scale(layout.scale,layout.scale);this.inProjection(layout,()=>original.draw.call(this));c.restore();}this.updateCamera();};
for(const name of ['down','motion','up'])proto[name]=function(id,x,y,...rest){const layout=this.managementProjection();if(layout&&Number.isFinite(x)&&Number.isFinite(y)){const r=layout.segments.find(r=>x>=r.x&&x<=r.x+420*layout.scale&&y>=r.y&&y<=r.y+r.height*layout.scale);if(!r){if(name==='up')return original.up.call(this,id,undefined,undefined,true);return;}return this.inProjection(layout,()=>original[name].call(this,id,(x-r.x)/layout.scale,(y-r.y)/layout.scale+r.start,...rest));}if(name==='down'&&this.repairMapHit(x,y)){if(this.repairPan)return;this.updateCamera();this.repairPan={id,x,y,startX:x,startY:y,active:false};this.game.move={x:0,y:0};return;}
if(this.repairPan?.id===id){const d=this.repairPan;
 if(name==='motion'){if(this.game.player.hp>0){this.repairPan=null;return;}if(Math.hypot(x-d.startX,y-d.startY)>8)d.active=true;if(d.active){this.repairCamera.x-=(x-d.x)/this.zoom;this.repairCamera.y-=(y-d.y)/this.zoom;this.updateCamera();}d.x=x;d.y=y;return;}
 if(name==='up'){this.repairPan=null;if(!rest[0]&&!d.active&&this.game.player.hp<=0){original.down.call(this,id,d.startX,d.startY);original.up.call(this,id,x,y,...rest);}return;}
}
const result=original[name].call(this,id,x,y,...rest);if(name==='up'&&this.w>this.h&&!this.touchIds[id])this.resetSticks();return result;};
const grenade=proto.grenadeLayout,build=proto.buildButtonLayout,hud=proto.vehicleHUDLayout;
proto.grenadeLayout=function(){return this.w>this.h?{x:this.w-72,y:this.h-90,radius:35}:grenade.call(this);};
proto.buildButtonLayout=function(){return this.w>this.h?{x:this.w-198,y:this.h-82,w:66,h:44}:build.call(this);};
proto.vehicleHUDLayout=function(){const r=hud.call(this);if(this.w>this.h)r.x=(this.w-r.w)/2;return r;};
}
const api={install};if(typeof module!=='undefined')module.exports=api;else globalThis.AlienResponsive=api;
})();
