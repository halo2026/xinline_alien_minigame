"""Assemble shared assets and the isolated fixed-pad campaign into the main game."""
from pathlib import Path
import shutil
R=Path(__file__).resolve().parents[1];W=R.parent/'alien-wolf-wechat';out=R/'shared/campaigns/wolf';out.mkdir(parents=True,exist_ok=True)
for name in ['core.js','view.js','level-data.js','art-data.js','responsive.js']:shutil.copy2(W/'shared'/name,out/name)
for name in ['insect-nests','insect-nest-art','equipment-fusion','bestiary','bestiary-data','progression','tactics','store','vehicle-gear','socket-tech','socket-ui','combat-hints']:(out/(name+'.js')).write_text("module.exports=require('../../"+name+"');\n")
shutil.copy2(W/'assets/terrain.png',R/'assets/wolf-terrain.png');shutil.copy2(W/'assets/wolf-scenery.png',R/'assets/wolf-scenery.png')
browser=(W/'browser/index.html').read_text().replace('../shared/level-data.js','../shared/campaigns/wolf/level-data.js').replace('../shared/art-data.js','../shared/campaigns/wolf/art-data.js').replace('../shared/core.js','../shared/campaigns/wolf/core.js').replace('../shared/view.js','../shared/campaigns/wolf/view.js').replace("f=>'../assets/'+f","f=>'../assets/'+(f==='terrain.png'?'wolf-terrain.png':f)")
(R/'browser/wolf.html').write_text(browser)
print('Campaign synced: 扫除虫患; shared progression and equipment save')

shutil.copy2(W/'assets/wolf-water.png',R/'assets/wolf-water.png')
