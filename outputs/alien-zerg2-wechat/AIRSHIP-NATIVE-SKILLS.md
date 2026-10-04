# Mother ship native combat restoration, 2026-09-26

Source: local alien-mac/source/XLFramework/Projects/alien_source/data/tabs/tab_unit.lua, tab_skill.lua and tab_effect.lua.

- Unit 11691 / skill 17312: four five-dart fans, 18-degree spacing. Horizontal speed 80, lifetime 5 seconds; vertical speed 200, lifetime 3 seconds. Cooldown 13 seconds. Restored native damage and effect 3069; added a one-second readable warning. Supersedes the borrowed cross/bombs random pool documented previously.
- Unit 16109 / skill 17677: laser6 link to moving ground contact, offset start below balloon, 520-unit sweep toward a locked target. Original 19020/14045 generates effect 3097 every 200ms. Adaptation: one-second warning and 1.2-second sweep, 3.2-second residual burn, total 4.4-second scorch visual with final 1.2-second fade. Contact radius 65 and 2x unit damage/sec; scorch radius 32 and 1x/sec, overlapping samples do not multiply damage. These are defense-game adaptations, not a complete Lua interpreter.
- 11692 / 17398: effect 3068 round projectile, 60% attack, speed 125, six-second interval; second act uses three projectiles with 30-degree spread.
- 11693 and 11694 / 14014: effect 3107 arrow projectile, speed 150 and five-second flight, intervals eight/six seconds.
- 16109 / 17660: heavy projectile in the second act, corresponding to the original difficulty gate.
- Assets: original effect/zidan.plist + zidan.png frames zidan1/2/4/12-1.png and effect/laser6.png, packed in assets/airship-weapons.png, art-data airship/* frames. The source labels 3107 green but its supplied texture is blue-white; texture colors were preserved.
- Extraction: work/gear-render/airship-art.cjs and airship-frames.json. Visual checks: airship-render.cjs produces warning/sweep/embers views.


## 2026-09-26 follow-up
- Ground burn rendering now uses the same irregular wheelScorch/wheelFire atlases as fire-wheel trails. Damage lasts 3.2 seconds; residual char fades until 4.4 seconds.
- Explicit refinery test verifies direct laser (2x balloon damage per second), lingering fire (1x), non-stacking overlaps, expiry, and lethal mission failure.
- Added user-requested mothership ground missile skill, separate from native cross darts: first volley 10 seconds after AI activation, repeat every 10 seconds (briefly deferred during another cast), six missiles, player/refinery random living target. Locked target center plus five ring impacts at radius 85. Warning/flight 1.7 seconds with 0.16-second staggering; blast radius 65, each missile 0.8x boss damage. Dodgeable, canceled if boss dies during flight.
- Desert texture generated with built-in imagegen; runtime source-atop maps onto original terrain alpha, cached once for both field and minimap. No navigation, unit route or prop collision changes. Pixel alpha identity verified across entire 1024x1280 image.

## 2026-09-26 13:20 siege balance
Refinery footprint radius55 now contributes to missile/beam/scorch contacts. Missile refinery multiplier5 (600 per missile,3600 full volley at base150), laser/scorch refinery multiplier6 (1200/600 DPS at base100); player values preserved. Balloon first and alternate eligible casts prioritize refinery within400, intervening casts retain nearby-player targeting. Overlapping scorches still use maximum DPS. Refinery hit bar orange for0.35 seconds.
