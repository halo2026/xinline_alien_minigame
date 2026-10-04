'use strict';
// The envelope is durable: a killed process can retry the identical write safely.
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
class CloudSave {
 constructor({local,key,call,onStatus=()=>{},onConflict=()=>{},chooseRemote=async()=>true,delay=1500}){
  Object.assign(this,{local,key,call,onStatus,onConflict,chooseRemote,delay});this.metaKey=key+':cloud-v1';this.ready=false;this.blocked=false;this.timer=null;this.flight=null;
 }
 persist(){this.local.set(this.metaKey,this.meta);}
 load(){return clone(this.meta?this.meta.data:this.local.get(this.key));}
 backup(reason){if(this.meta?.data)this.local.set(this.metaKey+':backup',{reason,at:Date.now(),...clone(this.meta)});}
 async start(){
  const remote=await this.call({action:'read'});this.check(remote);
  const cached=this.local.get(this.metaKey),legacy=this.local.get(this.key);
  this.meta=cached&&cached.owner===remote.owner?cached:{owner:remote.owner,revision:0,data:null,pending:null};
  // Never migrate another account's local progress into a new account.
  if(cached&&cached.owner!==remote.owner)this.local.set(this.metaKey+':account-backup',cached);
  if(!cached&&legacy)this.meta.data=clone(typeof legacy==='string'?JSON.parse(legacy):legacy);
  if(remote.record){
   if(this.meta.pending&&remote.record.operation===this.meta.pending.id){this.meta.revision=remote.record.revision;this.meta.pending=null;}
   if(this.meta.revision!==remote.record.revision){
    if(this.meta.data)this.backup('cloud-newer');
    const conflict=!!this.meta.pending;if(conflict&&!await this.chooseRemote())throw new Error('尚未选择云端存档');this.accept(remote.record);
    if(conflict)this.onStatus('recovered');
   }
  }else if(this.meta.revision){throw new Error('云端存档缺失，请检查环境，未覆盖本地数据');}
  this.ack=JSON.stringify(remote.record?.data);this.ready=true;this.persist();
  if(this.meta.data&&!this.meta.pending&&JSON.stringify(this.meta.data)!==this.ack)this.queue();
  await this.flush();return this.load();
 }
 check(r){if(!r||!r.owner||!['ok','conflict'].includes(r.status))throw new Error(r?.message||'云存档服务不可用');if(this.ready&&r.owner!==this.meta.owner)throw new Error('微信账号已改变，请重新进入游戏');}
 accept(record){this.meta.revision=record.revision;this.meta.data=clone(record.data);this.meta.pending=null;this.persist();}
 queue(){this.meta.pending={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),base:this.meta.revision,data:clone(this.meta.data)};this.persist();}
 save(data){
  if(!this.ready||this.blocked)throw new Error('云存档尚未就绪');
  this.meta.data=clone(data);this.persist();
  if(!this.meta.pending&&JSON.stringify(this.meta.data)!==this.ack)this.queue();
  if(!this.timer)this.timer=setTimeout(()=>{this.timer=null;this.flush().catch(()=>{});},this.delay);
 }
 async flush(){
  clearTimeout(this.timer);this.timer=null;
  if(this.flight)return this.flight;if(!this.ready||this.blocked)return;
  this.flight=this.drain().finally(()=>{this.flight=null;});return this.flight;
 }
 async drain(){try{
  while(this.meta.pending&&!this.blocked){const p=this.meta.pending;this.onStatus('syncing');
   const r=await this.call({action:'write',owner:this.meta.owner,revision:p.base,operation:p.id,data:p.data});this.check(r);
   if(r.status==='conflict'){this.backup('revision-conflict');this.blocked=true;this.onStatus('conflict');this.onConflict(r.record);return;}
   this.meta.revision=r.record.revision;this.meta.pending=null;this.ack=JSON.stringify(p.data);
   if(JSON.stringify(this.meta.data)!==this.ack)this.queue();else this.persist();
  }this.onStatus('saved');
 }catch(e){this.onStatus('offline');throw e;}}
 async refresh(){await this.flush();if(this.blocked)return;const r=await this.call({action:'read'});this.check(r);if(r.record&&r.record.revision!==this.meta.revision){this.backup('other-device');this.blocked=true;this.onStatus('conflict');this.onConflict(r.record);}}
 useRemote(record){this.accept(record);this.ack=JSON.stringify(this.meta.data);this.blocked=false;}
}
module.exports={CloudSave};
