# M07 — Contract consolidation + OpenAPI

- **Status:** pending
- **Depends on:** M06
- **Blocks:** M08 (CI runs the contract test)

## Goal

Collapse the three competing list conventions into one, and make the API self-describing. This is
the only milestone that touches `frontend/`.

Governed by [ADR 0003](../adr/0003-canonical-envelope.md).

## Canonical shape

```json
{ "success": true, "data": { "items": [ ... ], "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 } } }
```

## Two steps, one release

### Step 1 — backend, additive, no frontend change

`core/http/response.js` gains `paginated()`:

```js
paginated(res, { items, pagination, legacyKey })
```

It emits `items` **and** the legacy named key (`properties`, `users`, `leads`, …) while
`ENVELOPE_LEGACY_KEY=true` (the default). Every service that currently builds
`{ <key>, pagination }` by hand is replaced with it.

**Gate:** the M00 contract tests must be updated to assert `items` is present *alongside* the legacy
key, and the legacy key must still be present. Nothing the frontend reads today changes.

### Step 2 — frontend, then remove the alias

1. `lib/redux/api/propertyApi.ts:4-17` — `normalizeList` reads `items`.
2. `app/admin/{users,users/agents,users/builders}/page.tsx` — read `data.items`.
3. `app/admin/accounts/{registered,deleted,blocked}/page.tsx` — read `data.items` (currently reads
   `data` as an array + **top-level** `pagination`).
4. `app/admin/{leads,contacts}/page.tsx` — drop the defensive dual-shape reader.
5. `app/admin/properties/page.tsx`, `properties/approval/page.tsx` — read `data.items`.
6. All feedback list pages — read `data.items`.
7. Ship. Set `ENVELOPE_LEGACY_KEY=false`.
8. Delete the legacy-key branch and the `legacyKey` argument. **Close ADR 0003.**

## What must NOT change

| Contract | Why | Read at |
|---|---|---|
| `POST /auth/refresh` stays one shared endpoint for user and admin | The backend dispatches on the `role` claim. Splitting it breaks both reauth chains. | `baseApi.ts:38-52` |
| `data.accessToken` / `data.refreshToken` on every auth mutation | | `AuthProvider.tsx:39-40` |
| **401** exactly, for the reauth chain to fire | 403 or 419 silently never triggers a refresh. | `baseApi.ts:78` |
| `error: { message, code? }` | | `AuthProvider.tsx:45` |
| `data.image` is a **bare filename**, not a path | The frontend re-prefixes it. | `profile/picture/page.tsx:54` |
| `GET /admin/leads/export` → raw BOM-prefixed TSV | Consumed as a `Blob`. | `adminApi.ts:210` |
| `GET /properties/:id` → bare object under `data`, **not** wrapped in `items` | Six call sites unwrap it directly. | `properties/detail/page.tsx:31` |
| `/api` prefix, and `/uploads/**` at the API host root | `getAssetUrl` strips `/api` off `NEXT_PUBLIC_API_URL` to build asset URLs. | `lib/utils.ts:8,19` |
| Every admin path under `/api/admin/*` | `url.startsWith("/admin")` selects the admin token. | `baseApi.ts:13` |

## OpenAPI

`GET /api` currently advertises `docs: "/api/docs"` and that route does not exist
([M00 finding #9](M00-safety-net.md)). Generate OpenAPI 3.1 from the zod schemas and serve it for
real. `@asteasolutions/zod-to-openapi` reads the schemas already in each module — no second source
of truth.

## Definition of done

- [ ] Every paginated endpoint emits `items` + `pagination`
- [ ] Frontend list pages read `items`; no defensive dual-shape readers remain
- [ ] `ENVELOPE_LEGACY_KEY=false` deployed and the branch deleted
- [ ] ADR 0003 closed
- [ ] `/api/docs` serves a real OpenAPI document covering all mounted routes
- [ ] `GET /properties/:id` and `/admin/leads/export` unchanged
- [ ] `npx tsc --noEmit` clean in `frontend/`
