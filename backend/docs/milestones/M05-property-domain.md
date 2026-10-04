# M05 — Property domain: properties, leads

- **Status:** pending
- **Depends on:** M04
- **Blocks:** M07 (envelope consolidation touches every module)

## Goal

The highest-traffic domain, and the one carrying the worst data-modelling bug found in the review.
Do it properly.

## Modules

```
src/modules/properties/
src/modules/leads/
```

## Work items

### 1. Extract `VisibilityPolicy` — highest priority
The 4-condition visibility predicate is hardcoded at `property.service.js:10-15` and is **not
enforced everywhere**: admin queries ignore it, and `getMyProperties` (`:293`) applies no filter at
all. It belongs in `properties.policy.js` as the single definition, called by every read path that
should respect it. Test each path.

### 2. Migrate `price` off `VarChar`

[M00 finding #10](M00-safety-net.md): `price` is `VarChar(100)`, range-filtered as a string
(`:192-194`) and sorted as a string (`:207-208`). `"9000000" < "950000"`, so **the price filter and
the price sort are both wrong today**, and `@@index([price])` is a string index that cannot serve a
numeric range scan.

Plan:
1. Add `priceValue Decimal(14,2) @db.Decimal(14,2)` (nullable during backfill).
2. Backfill from the existing string. Prices are stored as user-entered strings — audit for
   separators, currency suffixes and blanks before writing the backfill, and record the count of
   unparseable rows.
3. Add composite index on `(deactivate, adminapproval, blocked_user, adminblock, priceValue)`.
4. Switch reads to `priceValue`, writes to write both.
5. Keep `price` (the display string) — the frontend formats from it.
6. Drop the old `@@index([price])`.

This is the only step in the plan that needs a **forward-only, reversible migration**; run it on a
database copy first and record the row counts in this file.

### 3. Collapse duplicated state transitions
`hideProperty` and `disapproveProperty` are byte-identical (`:394-412`), as are `displayProperty`
and `approveProperty` (`:374-392`). Four routes (`admin-property.routes.js:66,80,94,108`) collapse
to two distinct effects. Make it explicit: `setApproval(state)` and `setVisibility(state)`.

### 4. Parallelise image processing
`property.service.js:32-39,108-119` awaits `processAndSaveImage` (sharp, CPU-bound) inside a `for`
loop over up to 8 files. Serial. Batch with bounded concurrency — not `Promise.all` unbounded, or 8
concurrent sharp decodes will spike memory.

### 5. Leads
- `lead.service.js:98-115` loads **every** lead in range into memory to build TSV. Unbounded.
  Move to the M02 queue, stream the response, or cap it.
- The export is the one non-envelope response. It must stay raw BOM-prefixed TSV — the frontend
  consumes it as a `Blob` (`lib/redux/api/adminApi.ts:210`). Do not wrap it. See
  [ADR 0003](../adr/0003-canonical-envelope.md).
- `lead.routes.js:26-27` extracts ip/device in the route. Move into the service.
- Fix: the frontend calls `/api/admin/leads/export`; the route exists. But `/api/admin/feedback/*`
  does **not** exist on the backend (see [M06](M06-content-support-modules.md)).

### 6. Move admin contacts out
`admin-property.routes.js:267,285` host contact admin CRUD, dynamically importing `contact.service`
via `await import()` — the only dynamic import in the codebase. It belongs to M06.

## Deletions

```bash
git rm src/routes/property.routes.js src/routes/admin-property.routes.js src/routes/lead.routes.js
git rm src/services/property.service.js src/services/lead.service.js
```

## Verification

```bash
npx prisma migrate dev --name add_property_price_value
node --test test/modules/properties.test.js
node --test test/                    # baseline green
```

## Definition of done

- [ ] Every property read path goes through `VisibilityPolicy`
- [ ] `priceValue` backfilled, verified against the string column, index created
- [ ] Price sort and price range filter are **numeric** — tests assert `9000000 > 950000`
- [ ] `hide ≡ disapprove` and `display ≡ approve` collapsed
- [ ] 8-image upload no longer processes serially
- [ ] Lead export is bounded or streamed
- [ ] M00 baseline green throughout
