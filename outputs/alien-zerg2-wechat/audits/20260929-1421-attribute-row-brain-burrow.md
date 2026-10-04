# 0.9.29.1421 — attribute row and giant brain burrow

- Available points moved to left of four base attributes. Main/wolf shared draw and hit geometry. Original 30px plus buttons retained; wider XP gauge stops before archive button. Portrait/landscape Canvas renders and all eight plus hit targets verified. Two focused attribute UI tests pass after updating old level/tutorial/Canvas fixtures. Broad legacy attributes test suite still has unrelated outdated number/initial-level assertions; not claimed passing.
- Built-in image_gen used with native giant brain screenshot reference. Original alpha asset and complete prompt saved in source-art/giant-brain-burrow-generated.png and giant-brain-burrow-prompt.txt. Runtime sprite 384x235, 256-color alpha PNG, 38850 bytes, world footprint 520x280. Full-resolution master preserved outside package.
- Creep/slime mouth replaces plain ellipse; foreground lip occludes sinking/emerging body. Holes fade in .6s, remain up to25s, last7s fade, maximum6. Body shadow moved from (-30,+81) to (-42,+57), flatter and denser.
- After 2s underground brain selects new nearby location: random radius140-280, bounded fallback search120-300, within245-390 of refinery. Tests ground/nav footprint, player/tower clearance. Fully blocked search retains location safely. Timer, HP, attack/skill cadence unchanged. New position updates burrowOrigin and decal. Old hole remains briefly.
- All13 giant-brain tests pass, including24 seeded different safe destinations, no duplicate boss, post-emergence attack, hidden invulnerability. Deterministic phase-based renderer work/gear-render/brain-burrow-review.cjs captures dig, underground, new emergence.
- Total20910613 bytes; main2083453. Save epoch unchanged.
- Intermediate1414 (attribute-only) uploaded successfully, superseded before development Preview by this complete1421 release.
- Verified Upload Successfully and same-package Development Preview20259KB, expires9/29 14:49.
