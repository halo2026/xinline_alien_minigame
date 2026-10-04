# 0.9.29.0728 - Giant brain emergence and combat upgrade

- Size 1.35 -> 1.755 (30% increase), archive scale and text synchronized. Boss-only form preserved.
- HP 48000 -> 560000, matching effective HP of first-act final boss 12504 (280000 base x2 breakthrough).
- After 1.8s warning, 4.2s stationary underground emergence: smooth vertical rise under irregular ground mask, fixed burrow mouth, cracks, dust. Then native crawl and rock breach to refinery upper-right. Wider 140-unit breach radius matches enlarged body.
- Corrosion bombardment and consecutive ground spikes alternate after arrival. 1.25-2.1s ground warnings, real refinery/player damage, avoidable player targeting, owner-death cancellation. Ground spikes use original mini_dici sprites; motif from native skill 18007 (two casts 1s apart). Per-line victim set prevents repeated overlap damage.
- Normal refinery attack preserved; casting does not leave pending normal hits. No premature act completion.
- 44/44 tests passed: giant-brain, bestiary, failure-rewards, zerg-boss-skills, zerg-ten-waves.
- Canvas emergence and skill preview visually checked. Existing save epoch unchanged.
- Total package 20869281 bytes; main 2092039 bytes.
- Release verified: Upload Successfully; identical development Preview 20217 KB, expiry 9/29 07:57.
