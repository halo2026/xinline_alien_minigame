(function(){
const missions=[
{id:'zerg',title:'异虫',source:'yxys_zerg_002',art:0,waves:8,objective:'守护矿厂 · 两幕16波',runtime:true},
{id:'mine4',title:'4号矿坑',source:'mine4',art:8,waves:7,objective:'螺旋防线 · 两幕14波',runtime:true},
{id:'zerg1',title:'护矿使者',source:'yxys_zerg_001',art:7,waves:7,objective:'护送矿车 · 两幕14波',runtime:true},
{id:'snake3',title:'双头蛇窟',source:'yxys_snake_03',art:1,waves:7,objective:'守护基地 · 两幕14波',runtime:true},
{id:'ringmine',title:'R星前哨',source:'ringmine',art:8,waves:7,objective:'环山驻守 · 两幕14波',runtime:true},
{id:'airship3',title:'母舰',source:'yxys_airship_03',art:3,waves:7,objective:'守护基地 · 两幕15波',runtime:true},
{id:'thunderraid',title:'雷兽突袭',source:'thunder-raid',art:9,waves:8,objective:'双线守矿 · 两幕16波',runtime:true},
{id:'iron-alien',title:'铁血猎人',source:'iron-alien',art:10,waves:7,objective:'守护铁血猎人 · 两幕14波',runtime:true},
{id:'greenstar',title:'氪石矿脉',source:'td_009_jmhj',art:6,waves:15,objective:'守护三矿 · 两幕30波',runtime:true},
{id:'fish3',title:'母巢护卫',source:'yxys_fish_03',art:2,waves:8,objective:'守护基地 · 两幕16波',runtime:true},
{id:'fortress2',title:'空中堡垒',source:'yxys_mechanics_002',art:4,waves:9,objective:'守护基地 · 两幕18波',runtime:true},
{id:'scorpion2',title:'地狱魔蝎',source:'yxys_scorpion_02',art:5,waves:9,objective:'守护基地 · 两幕18波',runtime:true}];
const ids=missions.map(m=>m.id),giantScale=id=>1+.2*Math.max(0,ids.indexOf(id));
const api={missions,ids,giantScale};if(typeof module!=='undefined')module.exports=api;else globalThis.CampaignOrder=api;
})();
