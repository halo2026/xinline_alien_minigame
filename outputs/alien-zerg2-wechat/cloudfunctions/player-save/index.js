'use strict';
const cloud=require('wx-server-sdk');
const {createService}=require('./service');
cloud.init({env:cloud.DYNAMIC_CURRENT_ENV});
const db=cloud.database(),name='player_saves_v1';
const service=createService({
 read:async id=>{const r=await db.collection(name).where({_id:id}).limit(1).get();return r.data[0]||null;},
 create:async(id,data)=>db.collection(name).add({data:{_id:id,...data}}),
 change:async(id,fn)=>db.runTransaction(async tx=>{const doc=tx.collection(name).doc(id),r=await doc.get(),change=await fn(r.data);if(change.write)await doc.set({data:change.write});return change.result;})
});
exports.main=async event=>service(event,cloud.getWXContext());
