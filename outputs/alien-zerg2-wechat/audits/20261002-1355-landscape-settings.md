# Landscape settings button

Moved landscape settingsButtonLayout x from w-86 to8, y top+2,40x38; existing landscape metrics start54, leaving6px gap. Portrait staysw-44. Shared geometry is used by rendering and down hit testing. Both main and wolf source updated and synced/package built. No save changes.

Direct hit checks8/8: main/wolf at844x390,900x420,667x375,390x844. Orientation-menu tests3/3. Legacy orientation suite2/5; same3 pre-existing warehouse/confirmation-layout failures reproduced with old coordinate via work/settings-layout-before.cjs, logwork/settings-orientation-baseline.log. Canvas screenshotwork/landscape-settings-fixed.png reviewed: gearlefttop clear ofmetrics. No real phone test performed.

Build0.10.02.1355, package30844328 main2088947. Experience Upload Successfully verified. Identical Development Preview29954KB expiry10/02 14:24 verified. No publication pending.
