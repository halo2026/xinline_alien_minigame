# Settlement upgrade-arrow overlay — 0.10.03.1300

Screenshot failure modal shows green tower upgrade arrows on top. Cause: view draws arrows after settlement/failure overlay and towerUpgradeMarkers had no battle-state gate.

Main and wolf towerUpgradeMarkers now requires playing and not cleanup, also excludes attributes/chest/reward modals along with existing shop/inventory/tech/pause/build gates. Shared marker list controls drawing and marker interaction. Failure down handler already consumes input before tower selection; no change needed to failure buttons.

Two main/wolf regression tests cover actual upgrade-available markers during playing, lost/won/settlement/ready, cleanup and modals, then restoration after closing. Passed. Save/gameplay/balance unchanged. Package15 total29479637 main2094848 bytes.

Experience0.10.03.1300 visibly Upload Successfully verified; identical Development Preview28621KB expiry10/03 13:29 verified. No publication pending.
