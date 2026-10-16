'use strict';
const crypto=require('crypto');
const PACKS=[{price:600,amount:60},{price:3000,amount:360},{price:9800,amount:1200}];
const hmac=(key,value)=>crypto.createHmac('sha256',key).update(value).digest('hex');
// Only server-owned product definitions and authenticated identities enter signed requests.
function createService({config,login,query,orders,settle,now=Date.now,orderId=()=>crypto.randomBytes(16).toString('hex')}){
 return async(event,identity)=>{
  const {APPID:appId,OPENID:openid}=identity;
  if(!openid||appId!==config.appId)throw Error('UNAUTHENTICATED');
  if(!config.enabled||!config.offerId||!config.appKey||config.products?.length!==3)throw Error('PAYMENT_NOT_CONFIGURED');
  if(event.epoch!==config.epoch||event.slot!=='player')throw Error('INVALID_SAVE_SLOT');
  const owner=crypto.createHash('sha256').update(appId+':'+openid+':phone-v1:test-'+config.epoch).digest('hex');
  if(event.owner!==owner)throw Error('ACCOUNT_CHANGED');
  if(event.action==='pending')return {orders:await orders.pending(owner)};
  if(!['create','verify'].includes(event.action)||typeof event.code!=='string'||!event.code)throw Error('INVALID_REQUEST');
  const session=await login(event.code);
  if(session.openid!==openid||!session.session_key)throw Error('LOGIN_MISMATCH');
  if(event.action==='create'){
   const pack=Number.isInteger(event.pack)?PACKS[event.pack]:null;if(!pack)throw Error('INVALID_PRODUCT');
   const id=orderId(),productId=config.products[event.pack];
   const order={id,owner,openid,appId,epoch:config.epoch,env:config.env,offerId:config.offerId,zoneId:config.zoneId,productId,...pack,status:'pending',createdAt:now()};
   await orders.create(id,order);
   const signData=JSON.stringify({mode:'goods',offerId:order.offerId,buyQuantity:1,env:order.env,currencyType:'CNY',platform:'android',zoneId:order.zoneId,productId,goodsPrice:pack.price,outTradeNo:id});
   return {id,amount:pack.amount,price:pack.price,payData:{signData,paySig:hmac(config.appKey,'requestMidasPaymentGameItem&'+signData),signature:hmac(session.session_key,signData)}};
  }
  if(typeof event.id!=='string'||! /^[a-f0-9]{32}$/.test(event.id)||!Number.isSafeInteger(event.revision))throw Error('INVALID_ORDER');
  const order=await orders.get(event.id);if(!order||order.owner!==owner)throw Error('ORDER_NOT_FOUND');
  if(order.env!==config.env||order.offerId!==config.offerId)throw Error('ORDER_ENV_CHANGED');
  if(order.status!=='delivered'){
   const result=await query(order,session.session_key);
   if(result.out_trade_no!==order.id||result.product_id!==order.productId)throw Error('ORDER_MISMATCH');
   if(result.pay_state!==2)return {status:'pending',id:order.id};
  }
  // This transaction checks the save revision, grants once, and marks the order delivered together.
  return settle(order,event.revision);
 };
}
module.exports={createService,PACKS,hmac};
