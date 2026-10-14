# Constellation line provenance audit — baseline (2026-10-15)

**Scope:** Arpeggio audit branch only. No executable data, rendering or application behavior changed. **Do not merge to main without owner approval.**

## Immutable visual baseline

- Authoritative audited dataset: `KensukeSuga86/Nicole-Astronomy-Database`, `versions/0.3.3/data/constellation-standard.json` plus `constellation-line-stars.json` and `constellation-editor-audit.json`.
- 88 constellations; 717 directed line segments; 759 unique line endpoint IDs; 759 line-star metadata entries.
- **Creator clarification (2026-10-15): all 88 constellation line patterns were ultimately redrawn by KensukeSuga86.** The stored `constellation-editor-audit.json` metadata still marks **55 `edited` and 33 `v0.7.6_base_adopted`**; these labels describe the stored export/workflow lineage and **must not be treated as proof that 33 final patterns were simply copied without creator reworking**. The provenance documentation/metadata needs reconciliation with the creator's account.
- Recorded line-star provenance: 268 `constellation-project-v0.7.6`, **490** `Hipparcos Planetarium Data Creator / Stellarium-derived line-star catalog`, and 1 `nicole-db-v0.2.0-stars`.
- WARNING: the 490 upstream references have no embedded coordinate in the authoritative JSON. This is **not** an assurance that the runtime lacks coordinates: Arpeggio also includes `assets/hip_constellation_line_star.csv` (693 lines) and runtime fallback.
- The rendered line system uses `D.constellationStandard` for endpoint pairs and `D.constellationLineStars` plus fallback CSV for coordinates; see `engine.js` (`STANDARD_LINES`, `DB_LINE_STARS`, `STARLINE_URLS`).
- Preserve all 717 endpoint pairs and their ordering, the 88 constellation identifiers, and all actual projected positions until an owner-reviewed change is approved.

## Rights / upstream inspection

1. [Hipparcos Planetarium Data Creator](https://github.com/creativival/hipparcos_planetarium_data_creator) says the **project is GPLv2** and the **Stellarium-derived constellation-line data are used under GPLv2**. It identifies VizieR/CDS as a catalog host. This does **not** alone prove which provisions govern each numerical coordinate in Arpeggio.
2. [ESA Hipparcos catalogue statement](https://www.cosmos.esa.int/web/hipparcos/catalogues) specifies **CC BY-NC 3.0 IGO**, with **Credit: ESA**. The upstream project's claim of public-domain Hipparcos numbers differs and must not be assumed to override ESA's explicit terms.
3. The **line topology** and the **numeric star coordinates** are different resources. The creator confirms all 88 final patterns were redrawn. The legal assessment should examine the nature and independence of that redrawing, including any retained specific topology, rather than assume the 33 metadata-labelled patterns were adopted unchanged.
4. Numeric star positions and scientific facts can have a different protection analysis from copyrighted selection/arrangement or accompanying database artifacts. Obtain qualified legal review if strict no-redistribution is required.

## Safe replacement candidates — not yet approved

- **Coordinates:** search for a documented catalog with license compatible with contemplated personal/non-ticketed usage and potential future paid permissions; ensure epoch/equinox, coordinate system, HIP mapping and precision are equivalent before substituting. NASA hosting of the Hipparcos catalogue does not independently establish a public-domain license.
- **Topology:** prioritize retaining the creator-redrawn 88 patterns and documenting how they were independently selected/edited. Where a pattern's particular star-to-star topology reproduces source-specific choices, assess potential dependence and licensing; redrawing alone does not automatically eliminate those questions.
- **Alternative:** comply with third-party license obligations for any derived material and exclude these third-party portions from Nicole's custom redistribution restrictions.

## Regression checklist (before any data change)

- Compare 88 ordered endpoint lists with the fixed baseline (exact match).
- Resolve 759 endpoint IDs; report unmatched, duplicated, and missing coordinates explicitly.
- Render the same location/time/azimuth/altitude/FOV before/after and compare images at both 1x and 2x DPI.
- Check normal, all-sky, portrait and landscape iPad scenes; offline mode and existing cached PWA upgrade.
- Never write a new `main` version or merge an audit PR without express approval.

## Outstanding verification

- Compare Arpeggio's actual bundled `database/db-bundle.js` with DB v0.3.3 JSON. GitHub file connector cannot decode bundled binary/large content in this audit session, so **runtime identity and exact geometry are not yet independently verified**.
- Reconcile `edited` / `v0.7.6_base_adopted` export markers against creator-confirmed final editing of all 88; establish any evidence of independent line choices. Determine exact license/permissions of the CSV column set and any potentially source-derived topology, and provide attribution/exceptions accordingly.
- Identify an alternative coordinate catalog and validate matching RA/Dec values and epoch.
- If a replacement is proposed, make it on this branch only after separate owner approval.

## Correction log

- 2026-10-15: KensukeSuga86 clarified that **all 88 constellation-line drawings were ultimately redrawn personally**. Earlier language describing 33 as merely 'adopted existing line patterns' was an overinterpretation of export metadata. Keep the numerical metadata for traceability but do not assert absence of author edits. No runtime or geometric file has been modified.
