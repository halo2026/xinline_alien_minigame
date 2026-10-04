# 0.9.29.1357

- Giant brain ground contact shadow: broad soft ellipse at foot level. Walking dust emitted at world foot positions, age-based fade rather than attaching to moving actor.
- Random 20-30 second periodic dig start interval, first scheduled on arrival. 3.2s dig, 2s underground, 4.2s resurfacing in the same position, then resume refinery attack and skills. Walk animation time doubled while digging.
- Digging emits four native rock fragments per 70ms with ballistic height, horizontal scattering and spin, plus heavier foot dust; arrays expire (2.2s stones / 1.5s dust) and remain bounded.
- Pending normal attacks and owner hazards canceled when digging starts. Hidden underground phase is untargetable. No duplicate boss spawn and no premature act ending. Boss HP and scale retained.
- Failure and pause actions use identical base fill and the same helper, with explicit canvas state isolation. Removed all red failure panel decoration and title tint; no extra red/yellow action colors. Mirrored wolf source.
- 47/47 targeted tests pass, including cycle timing, resurfacing, skill cancellation, 2x frame rate, world-anchored dust and bounded particles.
- Canvas snapshots visually checked. Save epoch unchanged. Total 20872116 bytes, main 2092221.
- Not published separately: superseded by 0.9.29.1403 including equipment fusion.
