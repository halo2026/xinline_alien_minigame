'use strict';
const crypto=require('crypto');
function validate(data){
 if(!data||Object.getPrototypeOf(data)!==Object.prototype||JSON.stringify(data).length>200000||data.version!==5||!Number.isInteger(data.level)||data.level<1||data.level>99||!Number.isFinite(data.xp)||data.xp<0||!Array.isArray(data.inventory)||!Array.isArray(data.equipped))throw new Error('INVALID_SAVE');
 function walk(v,depth=0){if(depth>16)throw new Error('INVALID_SAVE');if(typeof v==='number'&&!Number.isFinite(v))throw new Error('INVALID_SAVE');if(v&&typeof v==='object')for(const [k,x]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k)||k.includes('.')||k.startsWith('$'))throw new Error('INVALID_SAVE');walk(x,depth+1);}}walk(data);
}
function createService({read,create,change,now=Date.now}){return async(event,identity)=>{
 if(!identity.OPENID||!identity.APPID)throw new Error('UNAUTHENTICATED');
 const owner=crypto.createHash('sha256').update(identity.APPID+':'+identity.OPENID+':'+(event.slot==='simulator'?'simulator':'phone-v1')+(['20260921-1227','20260923-2140','20260924-1506'].includes(event.epoch)?':test-'+event.epoch:'')).digest('hex');
 const response=(status,record)=>({status,owner,record});
 if(event.action==='read')return response('ok',await read(owner));
 if(event.owner!==owner)throw new Error('ACCOUNT_CHANGED');
 if(event.action!=='write'||!Number.isSafeInteger(event.revision)||event.revision<0||typeof event.operation!=='string'||!/^[a-zA-Z0-9-]{8,100}$/.test(event.operation))throw new Error('INVALID_REQUEST');
 validate(event.data);
 const next={revision:event.revision+1,operation:event.operation,data:event.data,updatedAt:now()};
 // Deterministic document ID + atomic add handles first-save races.
 if(event.revision===0){try{await create(owner,next);return response('ok',next);}catch(e){const old=await read(owner);if(!old)throw e;return response(old.operation===event.operation?'ok':'conflict',old);}}
 return change(owner,async old=>{if(!old)throw new Error('SAVE_MISSING');if(old.operation===event.operation)return {result:response('ok',old)};if(old.revision!==event.revision)return {result:response('conflict',old)};return {write:next,result:response('ok',next)};});
 };}
module.exports={createService,validate};
