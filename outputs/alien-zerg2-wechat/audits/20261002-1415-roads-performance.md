# Indoor roads + dense battle performance

Includes scorpion indoor roads described in20261002-1407-indoor-roads.md;1407 was never uploaded. Current build0.10.02.1415.

Measured deterministic4-minute scorpion2 run with20towers and immortal player/refinery solely in test fixture. Peak208monsters; finalwave9,194alive,128corpses,61fx,38bullets identical before/after. Fixed Date.now, seeded Math.random, game seed. update sampled last120s(7200steps); drawing sampled last20s at60draws/sec(1200frames). Desktop@napi-rs/canvas844x390; not a real-phone FPS claim.

Before: update4774.04ms/7200, draw10201.54ms/1200. After: update4331.23ms/7200 (-9.3%), draw8116.39ms/1200(-20.4%). Navigation blocked6849764checks1521.75ms to1002.88ms (~34% reduction). See committed audit JSONs for exact values. No target search algorithm changes after profiling; no enemy-count/attack-rate/difficulty nerf.

Implementation maincore: numericUint8collisiongrid keeps existing Set mutations/add/delete/clear and whole-set replacement synchronized (methods nonenumerable); caches invalidated on changes, preserves giantbrain destructible-rock behavior. Bounds/terrain references held by Navigation to avoid repeated fallback allocation.

Mainview: direct destination-rect sprite path when no flip/rotation and opacity already matches; fallback preserves transforms. Static stain layer half-world resolution refreshes on corpse changes at most4Hz, delayed landing and newbattle; persistent stains retained, pieces animate/fade unchanged. This adds2560x2560map1280x1280RGBA layer (~6.25MiB runtime), not assetpackage bytes. Fallen fragments skip expired work before terrain lookup. Spawn caves outsideviewport not drawn. Checked actual battle output visually. No main/wolf progression changes; wolf standalone rendering remains separate.

Tests32 distinct pass:14nav/road/canvas/machine-line +17stain/brain/remains +1pixel-exact sprite path.8campaigns90simsec each no matrix leak. Benchmark outcomes unchanged. Package31032098main2091765,16packages, within30MiBtotal2MiBmain. Checksums20261002-1415-sha256.json. Experience Upload Successfully verified for 0.10.02.1415. Identical Development Preview verified: 30137 KB, expiry 10/02 14:45. No publication pending.
