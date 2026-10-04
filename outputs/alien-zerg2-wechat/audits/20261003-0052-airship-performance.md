# Mother Ship performance and mail-monster encounters — 0.10.03.0052

User report: severe slowdown around waves13/14, giant brain digging with many remains/flying units. Exact device FPS/cause not conclusively measured. Deterministic desktop reproduction: airship3 wave12→14, four towers, 120sec, peak85enemies,128corpses,3600timed update frames and1200timed draw frames. @napi-rs Canvas native assets; desktop timings are NOT phone FPS.

Confirmed waste: giant-brain destroyed-rock records survived forever and drew nine sprites per rock every frame even with alpha zero; laser fire sprites continued drawing for1.2sec after heat reachedzero; expired corpse fragments repeatedly scanned. Fix removes expired rubble at17sec including after boss death, culls offscreen rubble, skips invisible flame phase, global zero-alpha sprites, and records exact last-fragment lifetime to exit completed remains early. Stains and visible effects keep previous lifetimes; combat/damage unchanged.

Same seeded scene before/after (new encounters not yet enabled during this comparison): sprite calls410412→332988 (-18.9%), ground-effect render882.49→599.30ms (-32.1%), total draw5372.21→5093.18ms (-5.2%), update972.54→990.13ms (noise/slight increase, no CPU improvement claim). Files work/airship-perf-{before,after}.json; harness work/gear-render/airship-perf.cjs. Later final-content stress run with new bosses reaches140enemies,112corpses, no crash; draw5767.54ms, update1102.74ms. New enemies add work; do not claim final content is universally faster than the old scene.

mail-monsters enabled for airship3 using native spawn ID, not zerg22. Both acts localwave2:hive,3:thunder,5:hive+thunder,6:hive+2thunder,7:hive+thunder. Existing zerg wave3/4 retained. Later same-batch reinforcements queued8seconds apart in existing pending queue so clearing waits for them. Scheduled caps:2live hives/3live thunder; surplus scheduled units skipped rather than unbounded backlog. Each hive has six live drone slots; existing nest population cap retained. Both IDs have airship archive aliases/roster/locations. Native final boss remains unchanged, mail bosses cannot trigger premature victory.

46 relevant tests passed (mail combat, both-act schedule, valid spawns/art, delayed arrival, caps, final boss, brain, airship skills, render expiry, sprite/stain);30 additional regression tests passed (includes8overlap mail tests,18archive,4tower save). Browser-global export smoke checked. Native atlas renders reviewed work/airship-mail-hive.png and work/airship-mail-thunder.png; return/drop/charge renders generated too.

Package15, total29475319 main2093848 bytes, under limits. Save key/epoch/reset policy unchanged.

Experience0.10.03.0052 visibly Upload Successfully verified; identical Development Preview refreshed28617KB expiry10/03 01:21. No publication pending.
