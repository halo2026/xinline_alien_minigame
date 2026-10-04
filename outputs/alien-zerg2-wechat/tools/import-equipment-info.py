"""Import original equipment tooltip strings and attribute formatting metadata."""
from pathlib import Path
import re,json
R=Path(__file__).resolve().parents[1]
S=R.parent/'alien-mac/source/XLFramework/Projects/alien_source/data'
strings=(S/'tabs/tab_string.lua').read_text()
var=(S/'scripts/var.lua').read_text()
lookup=dict(re.findall(r'_tab_string\["([^"]+)"\]\s*=\s*"([^"]*)"',strings))
reward=var.split('hVar.ItemRewardStr =',1)[1].split('}',1)[0]
labels={key:lookup.get(label,label) for key,label in re.findall(r'(\w+)\s*=\s*"([^"]+)"',reward)}
mode=var.split('hVar.ItemRewardStrMode =',1)[1].split('}',1)[0]
percent=set(re.findall(r'^\s*(\w+)\s*=\s*1',mode,re.M))
data=json.loads((R/'source-data.json').read_text())
for iid,item in data['itemTypes'].items():
 match=re.search(r'_tab_stringI\['+iid+r'\]\s*=\s*\{\s*"([^"]*)"\s*,\s*"([^"]*)"',strings)
 if match:item['name'],item['description']=match.groups()
 item['rewardLabels']={key:{'name':labels.get(key,key),'percent':key in percent} for key,*_ in item.get('reward',[])}
(R/'source-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
(R/'shared/level-data.js').write_text('(function(){const d='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=d;else globalThis.ZergLevel=d;})();')
print('Imported native equipment descriptions and units')
