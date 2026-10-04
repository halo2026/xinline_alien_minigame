# 0.9.29.1832 — menu button appearance

- gearPanel previously skipped ui-info nine-slice for width<=150, so narrow failure buttons differed from pause-menu buttons. New optional menu flag forces the same native metal surface at every width; other panels retain their existing behavior.
- Shared menuActionButton removes primary fill-gradient overlay and primary text tint. All surfaces/text now identical; primary only retains faint border glow. Explicitly resets shadow offsets/color to prevent inherited decoration. Failure uses same18px target type size as pause.
- Main/wolf source updated and campaign packaged copy synced.
- 10 failure behavior tests pass. Canvas compare at320/390/844: normalized primary/secondary outputs from actual pause/failure calls byte-identical, and128px buttons use ui-info. Portrait and landscape full renders inspected. Comparison exported to user outputs/menu-style-comparison.png.
- Package20910343 total,2083181 main; saves unchanged. Upload Successfully verified; superseded by1834 before development preview.
