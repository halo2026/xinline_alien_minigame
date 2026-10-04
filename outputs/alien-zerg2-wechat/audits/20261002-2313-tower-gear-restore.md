# Tower-equipped save restore crash — 0.10.02.2313

Reproduced exact outer PROGRESS_LOAD_FAILED with valid fresh progress + towerEquipment 12200:0 uid3 (starter anti-air). Cause: TypeError P.equipmentStats is not a function in socket-tech towerRules. progression.restoreBase called towerCompatible with partial API {catalog,towerModes}, missing equipmentStats required since fusion stats support. Any valid owned tower-equipped item triggers load failure, both campaign handoff and cold start. Earlier image retry fix is independent and did not repair this bug.

Fix main/wolf partial API passes equipmentStats. No save contents, key, epoch, reset logic or protective load failure guard changed. Existing valid saves can load in place.

29 tests passed: 4 new main/wolf tower gear restore tests exercising every operator, all 8 compatible item IDs, fusion stats, repeated restore and View cold construction; 7 save-safety tests; 18 socket tests. Save-safety fixtures now have tower gear and all campaigns act2; repeated handoffs preserve it (7 rerun passed). Build17 packages total31187769 main2093184. Experience 0.10.02.2313 Upload Successfully verified; identical Development Preview30289KB expiry10/02 23:42 verified. No publication pending.
