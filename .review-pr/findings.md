# Code review — Revi

## Summary

Single-family run (Claude-family reviewed; GPT-family did not run — mono topology). 5 findings kept after threshold/cap, 0 cross-confirmed (no second family to agree).

- Critical: 0
- High: 2
- Medium: 3
- Cross-confirmed: 0 of 5

No cap applied (5 findings, limit 15).

## Findings

| Severity | Category | File:Line | Title | Reviewers | Board issue |
|---|---|---|---|---|---|
| high | data | `packages/backend/src/shared/hebergements/hebergements.mapping.ts:41-46` | Unite→legacy mapping emits raw uuid strings, so the legacy FILE_* columns are written NULL on every feature-flag-ON write | claude | — |
| high | data | `packages/backend/src/services/hebergement/Hebergement.js:418-427` | `preserveLegacyUniteContext` restores type/pension/description but not prestationsHotelieres, which are deleted on every unite-flow update | claude | — |
| medium | data | `packages/migrations/src/migrations/20260929071549_migrate_hebergement_to_site_unite_hebergement.js:129` | Data-recovery migration hardcodes NULL for accessibilite_precision instead of copying the legacy column | claude | — |
| medium | data | `packages/migrations/src/migrations/20260929071549_migrate_hebergement_to_site_unite_hebergement.js:38` | Data migration drops the unique index idx_unite_hebergement_hebergement_id and never recreates it (nor in down()) | claude | — |
| medium | data | `packages/backend/src/services/hebergement/Hebergement.js:437-453` | front.hebergement.site_id is read but never written at runtime, so the migration's back-fill is lost on the first update | claude | — |

## Agreement

0 of 5 findings cross-confirmed (GPT-family did not run this cycle, so no second-family agreement is possible).

## Open questions

- Was dropping `idx_unite_hebergement_hebergement_id` required because production `front.hebergement` actually contains several `current = true` rows per `hebergement_id` (the `DISTINCT ON (h.hebergement_id) ... WHERE current = true` in PASS 1 suggests duplicates are expected)? If yes, what enforces "one current unité per hebergement_id" now that the unique index is gone, given the repository reads `rows[0]` without ORDER BY?
- Under the feature flag the unite payload carries no `type` / `pension`: `preserveLegacyUniteContext` re-reads them from the legacy row, so `front.site.hebergement_type_id` and `unite_hebergement_to_type_pension` can only ever be rewritten with the value the hébergement already had. Is the type/pension intentionally frozen after creation on the unite flow, or is the FO expected to keep sending them?
- `HebergementAdminController.getOne` (BO) returns the raw legacy hébergement with no `applyUniteToHebergement` overlay, unlike the FO `getOne`. Is that asymmetry intended while the flag is on, i.e. is the BO expected to keep reading front.hebergement only?
- `down()` of the data migration runs `DELETE FROM front.unite_hebergement / site_organisme / site` and resets `hebergement.site_id`, which also destroys everything the double-write has produced since deploy (not just the migrated rows). Is a rollback-after-traffic scenario accepted as lossy, or should down() only remove rows created by the migration?
- `updateStatut` now updates `front.unite_hebergement` with `WHERE id = $1 AND "current" IS TRUE`, relying on `unite_hebergement.id === hebergement.id` for the current version. Does any other code path change `front.hebergement.statut_id` (BO validation, batch, EIG) without going through this function and therefore desynchronise the two statuts?
- `HebergementUsagersController.getOne` calls `getUniteHebergementById(Number(hebergementId))` — is `:id` guaranteed to always be the numeric legacy id (never the `hebergement_id` uuid) on every FO caller, so that `Number(...)` can never produce NaN and a 500 from Postgres?
