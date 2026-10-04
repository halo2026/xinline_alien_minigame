# Wider native-resolution scorpion roads

Road width112 to156 (+39.3%); six existing centerlines unchanged. Reconstructed native2560x2560 terrain directly from yxys_scorpion_02.ter and t_12 steel textures using original importer tile rules, replacing prior1280x1280 bake. Native pixel detail is retained, not upscaled. Paving shares the native texture, with recessed steel bevels, subdued blue inset markers and panel seams; removed flat opaque brown/yellow road style.192-color PNG palette compression;412163bytes, +71592bytes versus previous bake. RGBA decoded terrain is25MiB vs6.25MiB before; no new runtime draw pass.

Build cells5340 original1 cells to2 (previous4012). Tower exclusion aligned with widened lanes; path/waves/navigation land unchanged. Three road tests pass including all six lanes, >100 adjacent build sites, and tower-placement rejection. Eightcampaigns actual canvas90simsec pass; scorpion screenshot reviewed. Source generator and routes updated. Native terrain source assets required to regenerate.

Build0.10.02.1439 total31103796 main2091871,17packages. No progression/save changes. Experience Upload Successfully verified for0.10.02.1439. Identical Development Preview30207KB expiry10/02 15:10 verified. No publication pending.
