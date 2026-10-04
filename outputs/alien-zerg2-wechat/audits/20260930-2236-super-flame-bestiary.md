# 0.9.30.2236 — super red flame and grouped bestiary

Verified original tab_skill.lua8005 (喷火塔 - 普通攻击) uses3114, including boosted three-projectile branch; effect3114 -> MODEL_EFFECT:fireball-buff5 -> fireball9.png. Also weapon12315 attackLv4+ uses3114. Replaced3113 asset with unchanged native fireball9. Twelve full-resolution300x150 frames/50ms. Runtime matte removal and red molten tint (G*.32 B*.09), cached12canvases. Horizontal source orientation, scale.48..83 with cross-axis2; muzzle.32. Emission interval60->30ms (double density), maximum15travelling sprites instead8. Preserves animated mouth, historical target sweep, damage1000/320DPS, and brainwave5.

Bestiary list now groups by native family (23cards), representing43individual forms. Detail tabs for available normal/elite/boss forms; boss-only entries remain one tab. Family card aggregates discovered form count, kills and unread indicator; selecting form only clears that form unread. Filters remain family-unique; boss filter opens boss form. Detail animation/gold elite sheen/rumor prose remain per-form. Saved keys/drop/unlock rules untouched. main and wolf shared/bestiary.js synced.

25tests pass bestiary18+mantis7, including unique grouped cards, switching3forms, per-form unlock/kill preservation, unread handling, boss filter and boss-only shape. Actual Canvas screenshots reviewed portrait390/420 and landscape900; fire render inspected. User outputs mantis-super-red.png,bestiary-grouped-list.png,bestiary-form-tabs.png.

Package24564933 total2084995 main. Checksums20260930-2236-sha256.json. UploadSuccessfully verified0.9.30.2236; same Development Preview23827KB expiry9/30 23:03 verified. No pending publication.
