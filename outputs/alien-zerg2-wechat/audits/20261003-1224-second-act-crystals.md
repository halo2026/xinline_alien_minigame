# Fresh act2 entry crystals — 0.10.03.1224

User rule: restarting/directly entering act2 uses the same initial crystals as act1; actual first-to-second act continuation retains current crystals.

Core constructor no longer replaces campaign's normal entry gold with checkpoint.gold when restoring act2. grantEntryCrystals applies the same one-time entry bonus on fresh act2 as fresh act1 and records final secondActStartGold. beginSecondAct on existing live Game keeps current balance and does not invoke entry grant. Per-campaign base amount remains from existing setup; no single global amount imposed. Cards/convoy losses/progression retained. First-act campaign supply carry and retry behavior unchanged; save key/epoch unchanged.

22tests passed:8 two-act campaigns (zerg,zerg1,greenstar,snake3,airship3,fish3,fortress2,scorpion2) tested low/high checkpoint gold, fresh act2, retry, previous-act restart, entry bonus and no double grant, plus live act continuation;10campaign supplies tests including adjusted cold-act2 expectation;4tower save restore tests. Additional7campaign-save-safety tests passed. Old radar fixture uses migrated20301 ID and no longer valid current stats; unchanged after exploratory run, not counted as passing.

Package15 total29479383 main2094594 bytes. Experience0.10.03.1224 visibly Upload Successfully verified; identical Development Preview28621KB expiry10/03 12:53 verified. No publication pending.
