# 地狱魔蝎画面递归缩小修复

QQ mail Oct 2 13:09, subject 异星要塞微信小游戏; attachments 1002_1.jpg and 1002_2.jpg reviewed in Safari. Report: stage/viewport corrupt within one minute; screenshots show metallic floor, nested shrinking star backgrounds, missing HUD.

Reproduced pre-fix in scorpion2 at simulated 10.05 seconds: TypeError reading x in emerging enemy rendering, shared/view.js. Defense factory spread baseD.ambush (spawn31, sideCave true) into all defense maps; scorpion2 has no point31. Cave clipping accessed C.points[31].x before checking image availability. Throw after world/enemy save left canvas transform active; host catch restored only one level, so repeated frames compounded zoom and translation. This is a confirmed rendering defect, not evidence of persistent save loss or network trouble.

Changes: defense factory explicitly sets ambush from campaign data or null; emerging enemy clip checks point existence; world pass, enemy pass, and sprite draw save/restore protected with finally. No progression data or balance changes.

Tests: four new canvas tests cover all defense entrances, absent side-cave point, injected enemy failure restoring matrix and next frame, and injected image failure restoring sprite state. These plus six save safety tests:10/10. Actual assets, full canvas pipeline, all enemies visible, 8 campaigns each90 simulated seconds with identity-transform assertions after every sampled frame: all pass. work/scorpion-render-fixed.png visually reviewed, HUD and map normal after90s.

Broader legacy suites:17 pass9 fail. Baseline pre-fix factory has identical9 failures (obsolete failure-reward expectations7, old campaign order1, old zerg1 boss hit timing1). Baseline log work/campaign-legacy-baseline.log; no changes to unrelated tests or behavior.

Package30844334 bytes, main2088953,16packages. Build0.10.02.1339. Checksum file20261002-1339-sha256.json. Experience upload: Upload Successfully verified. Identical Development Preview verified:29954KB, expiry10/02 14:09. No publication pending.
