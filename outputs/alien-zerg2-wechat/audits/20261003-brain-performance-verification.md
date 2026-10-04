# Mother Ship giant brain: controlled verification on published1149 code

Read-only investigation requested by user. No production code, assets, save data or published package changed.

Actual native assets, airship3, four towers, seeded4221,420x900 logical canvas at2x backing resolution using@napi-rs/canvas. Start at wave12 and advance battle through brain phases. For each fixed state warm five full renders, then90 paired alternating-order renders for full, hide body only, and omit whole brain+owned effects. No simulation advancement within each paired sample. Headless desktop renderer, not phone/WeChat GPU. Timings cannot predict deviceFPS or establish sole cause of sustained phone slowdown.

Fixed-state median full/without-brain milliseconds:
- warning1.689/1.680 (negligible)
- emergence1.816/1.662 (+9.2%)
- attack1.939/1.845 (+5.1%)
- digging4.275/3.755 (+13.8%)
- underground3.921/3.578 (+9.6%; previous digging particles remain visible)

Digging at36.75s:88enemies,84stones,32footDust; underground38.6s:102enemies,64stones,18dust. Hiding only body during digging4.266 vs full4.275ms: particle/ground effects dominate, not the body sprite. Brain logic median0.00067ms attack /0.00629ms dig; occasional first rock destruction~1ms. No evidence of a continuing brain-AI loop stall.

Independent fixed-state particle ablation (different run, compare only within run): digging full3.737ms, noStones3.382,noDust3.650, noBrain3.197. Stones account for~66% of isolated brain render increment, dust~16%; remaining hole/shadow/other effects. Underground full3.316,noStones3.080,noDust3.220,noBrain3.001. Removing effects is benchmark-only; normal game retained visuals.

Earlier60sec live simulation additionally completed,124enemies, pools bounded; no runaway accumulation. Current brain rubble expiry17sec fix remains active. Scene complexity also grows during later waves (36enemies at attack snapshot to88atdig), so temporal before/after alone overstates brain causality.

Evidence: work/gear-render/brain-{isolation,fixedstate,particles}-perf.cjs; work/brain-isolation-before.json; work/brain-fixedstate-before.json; work/brain-fixedstate-counts.jsonl; work/brain-particles.json; work/brain-particles-counts.jsonl.

Conclusion: confirmed bounded extra render cost, concentrated in digging stones and dust, which can push a phone already near its frame budget over the limit. Did not reproduce sustained severe phoneFPS loss or identify brain as sole cause. Last published version remains0.10.03.1149.
