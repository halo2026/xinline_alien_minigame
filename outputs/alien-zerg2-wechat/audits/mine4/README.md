
2026-10-05 scenery and command-mode revision:
- Source terrain: original data/terrain/t_04.png; native boulder and spire frames cartoon_stone05/06 from data/xlobj/xlobjs.plist/png. Baked into existing terrain JPG, no additional live draw calls.
- Inward cliff bands, rock strata, rim lighting and radial atmospheric shading show the spiral rising from the central pit. Rock placement excludes roads and construction terraces.
- Command-only chapter disables vehicle motion/fire, grenade/card activation and companion updates/rendering. Tower satellites remain active. Distant ground rewards collect automatically.
- Pan gestures use an 8 px threshold and defer world taps until release. Both orientations tested; cancelled and resized gestures do not place towers.
- 31 smoke checks and 19 mine4/continuation/save tests passed. Canvas previews: phone.png, landscape.png and overview.png.
- Package total 31,171,697 bytes, below 30 MiB cap.

2026-10-05 weapon regression and art corrections (0.10.05.0230):
- Fixed mine4's fire override to reject only the player; tower calls and recursive shockwave pulses delegate to the original implementation.
- Mine4 tower projectiles cross unwalkable elevation gaps, while actual prop collision cells remain blocking.
- Added projectile coverage and real update/damage checks for all four basic tower families. Nine mine4 tests and 31 smoke checks passed.
- Replaced the procedural crater/rings with giant-brain-burrow.png, reused from the original brain boss encounter.
- Corrected rock rendering to the same scale 1 as view.js props: stone05 102x108 and stone06 108x154; removed square stretching and 100–230 random sizing. Regenerated terrain, chapter icon and previews.

Human mining compound (0.10.05.0240): native t_13 industrial floor, shop communications building, garage, power/service equipment, storage crates and barrels flank the existing central dock. Native prop/5140 crystal veins and original rocks form the surrounding deposits. Decorative service yards stay outside the original construction/navigation area; the refinery and miner routes remain clear. No new runtime assets; regenerated chapter icon and Canvas previews. Final package 31,190,598 bytes; all nine mine4 checks pass.

Terrain clarity and seam correction (0.10.05.0300):
- Render at full 2304x2784 world resolution (previously 1152x1392).
- Replace mirrored atlas repetition with deterministic overlapping radial-feathered samples of original t_04 terrain. Continuous world texture eliminates hard square atlas lighting seams.
- Smooth path interpolation, soften cliff striations, remove obsolete dock outline beneath expanded base. Chapter-icon crop updated for full resolution.
- JPEG budget guard: 398,026 bytes at quality 64; final package 31,435,885 bytes under 30 MiB. Eleven mine4/package checks passed; phone and overview previews inspected.

Base approach (0.10.05.0310): tangent-aligned cubic exit replaces the abrupt spiral-to-dock corner; route and navigation grid share the revised geometry. Base curb opens at the entrance and road texture fades into concrete. Eleven mine4/package checks passed. User-adjusted fresh starting crystals verified at 3500; enemy +30% tuning retained.

Breach egg dressing (0.10.05.0320): 14 deterministic irregularly spaced native egg/egg2 stand frames at their existing 0.8 scale surround the north/west/east burrow rim; south stays open. Static terrain decoration introduces no extra monsters, blockers or runtime draw calls. Updated terrain and chapter icon. Breach close-up inspected; 11 mine4/package checks passed.

Act II air pressure and attacks (0.10.05.0350):
- Optional secondActWaves preserves other campaigns' repeat schedules. Mine4 adds 4/6/8/10/12/14/16 native 12509 dragons via central spawn 2, direct aerial pursuit of refinery, ignoring ground navigation.
- Ordinary HP multiplier 1.3 -> 1.56 (+20% vs previous); boss remains 1.3. Existing act scaling and attack multipliers retained.
- Mine4 attack cycles reset animAge for each strike and return to stand after the clip. Native ranged enemies and dragons launch their projectiles instead of instant melee damage.
- Tower detail label clarified as 基础塔: cannon 250/1.6 versus howitzer 210/1.87 are different weapon modes, not a research penalty. No tower combat balance changed.
- 31 smoke checks plus 16 mine4/opening-delay checks passed, including dragon movement/damage and repeated attacks for five species.
