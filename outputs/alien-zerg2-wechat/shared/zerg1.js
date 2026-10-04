(function(){
const node=typeof require==='function',raw=node?require('./zerg1-data'):globalThis.ZergOneData,baseD=node?require('./level-data'):globalThis.ZergLevel,baseA=node?require('./art-data'):globalThis.ZergArt,core=node?require('./core'):globalThis.ZergCore,view=node?require('./view'):globalThis.ZergView;
const {art,...data}=raw,D={...baseD,...data,strategicRoads:null,unitTypes:{...baseD.unitTypes,...data.unitTypes}},A={...baseA,pages:[...baseA.pages,'zerg1-scenery.png'],frames:{...baseA.frames},groups:{...baseA.groups,...art.groups},props:art.props,blocks:art.blocks};
for(const [key,f]of Object.entries(art.frames))A.frames[key]={...f,page:baseA.pages.length};
A.groups['11256']=A.groups['12500'];A.groups['12517']=A.groups['12501'];
const runtime=node?require('./zerg1-runtime'):globalThis.ZergOneRuntime;runtime.prepare(D,A);
const C=core.create(D,A),api={api:view.create(D,A,C),core:C,art:A,data:D};runtime.install(C,api.api,D,A);if(node)module.exports=api;else globalThis.ZergOne=api;
})();
