# 0.9.29.1403 - Equipment fusion, grounded brain and neutral failure UI

Includes all changes in 1357 audit (that package was not published).

- Equipment fusion reopened for blue, gold and red. Three same-name, same-quality items become one item with same ID, quality and level. Each base stat and effective technology attribute inherits maximum of three inputs, then +5%. No currency fee or old +10 rank cap. White items excluded. User was asked optional clarification; these defaults were stated in commentary while implementing.
- New equipment-fusion.js in defense-code installs shared game/view logic in main and wolf. Restored real gear-detail button (socket-ui overrides old view methods), full result preview, paged attributes for landscape, and inherited-attribute inspection.
- fusionStats and fusionTech persist through progression restore. Technology floor uses max(inherited, currently rolled socket sum) to prevent double counting. Retains largest socket count. Socket reforging remains available; inherited floors survive it. Basic gear stats now feed actual fire trail, ram, satellites, air defense, repair, nuke, player totals and tower equipment.
- Consumes two material IDs atomically after validating warehouse/quality/name/equipped state. Retains primary UID; no accidental construction count increase. Overflow refill and save checked.
- 88/88 tests: equipment-fusion, socket-tech, vehicle-gear, giant-brain, failure-rewards, bestiary, warehouse-materials. Native Canvas portrait/landscape preview, open/confirm/inspect interactions checked.
- Total package 20870462 bytes; main 2083239 bytes. Save epoch unchanged.
- Release verified: Upload Successfully; identical Development Preview 20219 KB, expiry 9/29 14:31.
