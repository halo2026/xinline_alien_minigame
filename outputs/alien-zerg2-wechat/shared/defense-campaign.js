(function(){
const node=typeof require==='function',baseD=node?require('./level-data'):globalThis.ZergLevel,baseA=node?require('./art-data'):globalThis.ZergArt,core=node?require('./core'):globalThis.ZergCore,view=node?require('./view'):globalThis.ZergView;
function create(raw,art){
 const {art:scenery,...data}=raw,D={...baseD,...data,ambush:data.ambush||null,strategicRoads:null,unitTypes:{...baseD.unitTypes,...data.unitTypes},buildTerrain:{...data.buildTerrain,cells:Array.from(data.buildTerrain.cells,Number)}},A={...baseA,pages:[...baseA.pages],frames:{...baseA.frames},groups:{...baseA.groups},props:scenery.props,blocks:scenery.blocks};
 if(D.campaignConfig.id==='snake3'){
  // Cumulative rounding retains 80% of each wave without eliminating small lanes.
  const reduce=waves=>waves.map(wave=>{let total=0,kept=0;return wave.map(cmd=>{let count=cmd.count;if(!D.campaignConfig.bossIds.includes(cmd.unit)){total+=count;count=Math.round(total*.8)-kept;kept+=count;}return {...cmd,count,hpScale:(cmd.hpScale||1)*1.3,attackScale:(cmd.attackScale||1)*1.3};}).filter(cmd=>cmd.count>0);});
  D.waves=reduce(D.waves);if(D.secondActWaves)D.secondActWaves=reduce(D.secondActWaves);
 }
 const transport=D.campaignConfig.id==='fish3'?(node?require('./fish3-runtime'):globalThis.Fish3Runtime):null;if(transport)transport.prepare(D);
 // Keep the transport cargo ID/stats while using the sharper native beetle animation.
 if(D.campaignConfig.id==='fish3'&&D.unitTypes[12987])D.unitTypes[12987]={...D.unitTypes[12987],name:'钳虫',model:'MODEL:UNIT_BIGBEETLE'};
 const used=new Set(scenery.props.map(p=>p.frame));for(const id of Object.keys(data.unitTypes)){if(D.campaignConfig.id==='fish3'&&+id===12987){A.groups[id]=baseA.groups[12504];continue;}const source=transport&&+id===12982?12980:id,group=art.groups[art.aliases[source]||source];if(!group)throw new Error('Missing native model '+id);A.groups[id]=group;for(const rows of Object.values(group.anim))for(const list of Object.values(rows))for(const f of list)used.add(f);}
 const pages=new Map();for(const name of used){const f=art.frames[name];if(!pages.has(f.page)){pages.set(f.page,A.pages.length);A.pages.push(art.pages[f.page]);}A.frames[name]={...f,page:pages.get(f.page)};}
 const C=core.create(D,A),api=view.create(D,A,C);if(transport)transport.install(C,api,D,A);return {api,core:C,art:A,data:D};
}
if(node)module.exports={create};else globalThis.DefenseCampaign={create};
})();
