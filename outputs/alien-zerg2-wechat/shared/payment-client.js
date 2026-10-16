'use strict';
// No client callback can grant currency. Only a server-confirmed cloud save is applied.
class PaymentClient{
 constructor({wx,cloudStore,epoch}){Object.assign(this,{wx,cloudStore,epoch});this.busy=false;}
 async call(data){const c=this.cloudStore;if(!c?.ready||c.blocked)throw Error('请先完成云存档同步');const r=(await this.wx.cloud.callFunction({name:'game-payment',data:{...data,epoch:this.epoch,slot:'player',owner:c.meta.owner}})).result;if(!r||r.status==='error')throw Error(r?.code==='PAYMENT_NOT_CONFIGURED'?'支付尚未配置完成':r?.code||'支付服务暂不可用');return r;}
 async code(){const r=await new Promise((resolve,reject)=>this.wx.login({success:resolve,fail:reject}));if(!r.code)throw Error('微信登录失败');return r.code;}
 async verify(id){const c=this.cloudStore;await c.flush();if(c.blocked)throw Error('云存档有更新，请同步后重试');const r=await this.call({action:'verify',id,code:await this.code(),revision:c.meta.revision});if(r.status==='conflict')throw Error('云存档有更新，请重新进入后查询到账');if(r.status==='delivered'){c.useRemote(r.record);return r;}return null;}
 async buy(pack){if(this.busy)throw Error('支付处理中');const platform=(this.wx.getDeviceInfo?.()||this.wx.getSystemInfoSync()).platform;if(platform!=='android'||!this.wx.requestMidasPaymentGameItem)throw Error('请使用支持支付的安卓微信');this.busy=true;try{await this.cloudStore.flush();const order=await this.call({action:'create',pack,code:await this.code()});let failure;try{await new Promise((resolve,reject)=>this.wx.requestMidasPaymentGameItem({...order.payData,success:resolve,fail:reject}));}catch(e){failure=e;}
 for(let i=0;i<4;i++){if(i)await new Promise(r=>setTimeout(r,1200));const delivered=await this.verify(order.id);if(delivered)return delivered;}
 if(failure&&[-2,1,7].includes(failure.errCode))throw Error('已取消支付');throw Error('订单待确认，请稍后重新打开补给站查询到账');
 }finally{this.busy=false;}}
 async recover(onDelivered=()=>{}){if(this.busy)return null;this.busy=true;try{await this.cloudStore.flush();const r=await this.call({action:'pending'});let last=null;for(const o of r.orders||[]){const delivered=await this.verify(o.id);if(delivered){last=delivered;onDelivered(delivered);}}return last;}finally{this.busy=false;}}
}
module.exports={PaymentClient};
