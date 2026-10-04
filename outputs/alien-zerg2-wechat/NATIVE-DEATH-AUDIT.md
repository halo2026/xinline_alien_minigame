# Native death and direction audit

- Native `tab_skill[21012]` spawns six effect3060 instances on ground positions. Model `pjdbz` is pojiadanbaozha with roll90 and 150ms frames. Imported atlas points right; Canvas ground eruption now rotates -90deg with ground-base alignment. Shared shock/explosion renderer covers boss attack, destructible chest, and vehicle death.
- Native `zhadan6` / effect3239 has roll90. Its atlas nose points up; projectile heading uses heading+90deg, independent of ground-explosion convention.
- Audited tactical model initial rolls: 541(-90), 3239(90), 3451(-180), 598(180), 3241(180), 3406(-180). Central tactical renderer applies them once.
- `game_start_special_event.lua` tank-death handler simultaneously uses avatar body effect3500, driver3473/3502, and laser weapon3480. Imported all47 original RGBA frames with trim offsets and numeric ordering, original89ms interval. Bodies remain until repair, hidden when revived/victory repaired.
- To fit the20MiB package, atlas-1 RGB channels were rounded to8-step levels (maximum4/255 color difference), alpha unchanged. Full preoptimization atlas is `work/atlas-1-before-palette.png`. New death sprites remain original RGBA pixels.
- Wave9–16 schedules retain roster, ordinary HP×.85, attack×.9, unit spawn interval×1.15; wave16 boss HP multiplier1.5 and attack1.25. No continuous-stage reinsertion; positions unchanged.
