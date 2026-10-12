const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath('/System/Library/Fonts/STHeiti Medium.ttc','sans-serif');
for(const root of ['alien-zerg2-wechat','alien-wolf-wechat'])test(root+' complete warehouse renders past chests without changing item data',async()=>{
 const base=path.resolve(__dirname,'../../'+root),A=require(base+'/shared/art-data'),P=require(base+'/shared/progression'),{View}=require(base+'/shared/view'),pages=await Promise.all(A.pages.map(f=>loadImage(path.join(base,'assets',f)))),canvas=createCanvas(430,932),v=new View(canvas.getContext('2d'),{pages},430,932),s=v.game.progress;
 s.chips=12;s.kryptonite=671;s.level=16;s.hasOpenedChest=true;s.resourceIntroStep=5;s.battleIntroStep=3;s.inventory.push({id:P.CHEST_ID,uid:800,count:12},{id:41043,uid:801,requiredLevel:1,sockets:[null,null]});s.warehouse[0]=800;s.warehouse[1]=801;
 P.syncWarehouseMaterials(s);
 const before=JSON.stringify({inventory:s.inventory,warehouse:s.warehouse,equipped:s.equipped}),seen=[],tile=v.gearTile;v.gearTile=function(item,...args){seen.push(item.id);return tile.call(this,item,...args);};v.inventoryOpen=true;assert.doesNotThrow(()=>v.drawInventory());assert(seen.includes(P.CHEST_ID));assert(seen.indexOf(41043)>seen.indexOf(P.CHEST_ID));assert.equal(JSON.stringify({inventory:s.inventory,warehouse:s.warehouse,equipped:s.equipped}),before);
 if(root==='alien-zerg2-wechat'){fs.mkdirSync(path.join(base,'audits/warehouse'),{recursive:true});fs.writeFileSync(path.join(base,'audits/warehouse/fixed.png'),canvas.toBuffer('image/png'));}
});
