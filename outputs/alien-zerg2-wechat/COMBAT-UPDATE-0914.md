2026-09-14 combat updates

Both source stages updated and package synced:
- Rocket paired launcher anchors calibrated from family/6022 attack sprite rows 1–17, mirrored by the same 32-direction selection as renderer. Wolf applies .8 scale.
- Rocket range base 672 (zerg),571.2(wolf), range upgrade +8%/rank.
- Salvo gap 1 second, damage spec subtracts .1/level, floor .5 seconds. Six rounds alternate launcher sides. Damage total unchanged. Scatter clamped inside range annulus.
- Cannon/howitzer minimum range 160 zerg/128 wolf (about two 80-unit vehicle bodies, wolf .8 scale). Rocket retains larger 280 minimum. Target selection and launch both enforce blind zones.
- Pet 12511 source: tabs/tab_unit.lua 52920+, hp50000, restore100/sec, native dead animation. No explicit base rebirth time in that entry: new prototype repairTime20 seconds unlimited; full HP near player via summonPoints, shield2s. Dead pending attack/target/route cleared.
- Cards unavailable due to player repair or their individual native cooldown are grey, no repair/cooldown text; quantity retained. Existing ready time still prevents casts.
- Enemy bars60x8, boss104x12, gold gradient frame/red gradient fill.
- Stage8 cleanup to9 retains gold; clears towers as before.

42 relevant combat/campaign regression tests and 2 packaging/loading tests passed. New visual checks: rocket-anchor-after.png, health-bar-check.png under outputs. No new phone verification claimed.
