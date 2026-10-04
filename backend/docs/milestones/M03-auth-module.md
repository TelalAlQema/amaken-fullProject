# M03 — `modules/auth` (the reference module)

- **Status:** pending
- **Depends on:** M02
- **Blocks:** M04 → M06

## Goal

Build the **first** module. Every other module is a copy of the pattern proven here. Do not shortcut
this one.

## Target

```
src/modules/auth/
├── index.js                  # the ONLY public surface
├── auth.routes.js            # HTTP: parse, validate, delegate, respond
├── auth.service.js           # domain logic, transactions
├── auth.repository.js        # the only file that touches prisma in this module
├── auth.schema.js            # zod schemas (imported from @amaken/shared where they exist)
├── auth.policy.js            # who may call what
├── token.service.js          # issue/verify, rotation, revocation
└── auth.mapper.js            # entity → wire shape
```

```js
// src/modules/auth/index.js
module.exports = {
  name: "auth",
  mounts: [
    { path: "/api/auth", router: publicRouter, guards: [] },
  ],
};
```

`src/bootstrap/registerModules.js` iterates the registry; `app.js` mounts them. Paths stay
byte-identical to today, so the frontend does not move.

## Layering rules (enforced by lint in M08, by review until then)

```
routes → service → repository → platform → core
```

- `auth.routes.js` never imports prisma. No `try/catch` — `asyncHandler` handles it.
- `auth.service.js` never touches `req` / `res`.
- `auth.repository.js` is the only prisma caller.
- Nothing imports another module's internals — only its `index.js`.

## Security work in this milestone

| Item | Detail |
|---|---|
| Refresh token rotation | Every refresh issues a new refresh token. Reuse of a rotated token revokes the whole family. |
| `jti` + `tokenVersion` | `tokenVersion` already exists on the user. Add a `jti` claim so individual tokens can be denied. |
| Optional Redis denylist | Deny list in Redis with TTL = token lifetime. Cheap; reuses the M02 client. |
| Single hash implementation | `auth.service.js:180` falls back to **SHA-256**, `admin.service.js:67` to **SHA-1**, each with its own inline bcrypt-upgrade block. M03 standardises the *user* path on bcrypt cost 12; M04 removes the admin SHA-1 path. |
| `jti` and `type` claims | `verifyAccessToken` currently collapses "expired" and "malformed" into `null`. Distinguish them so the 401 code is meaningful. |

## Deletions

Once green and verified against the M00 baseline:

```bash
git rm src/routes/auth.routes.js src/services/auth.service.js src/services/jwt.service.js
```

`email.service.js` moves to `platform/mail/` in M04, once `admin.service.js` (its only other caller)
has moved.

## Verification

```bash
node --check src/modules/auth/*.js
node --test test/modules/auth.test.js
node --test test/                    # full M00 baseline still green
node src/index.js
```

## Definition of done

- [ ] All 9 `/api/auth/*` endpoints behave exactly as the M00 baseline pinned them
- [ ] Refresh rotation works; reuse of a rotated token revokes the family
- [ ] `auth.routes.js` contains no `require("../../../lib/prisma")`
- [ ] No `try/catch` remains in `auth.routes.js` (asyncHandler covers it)
- [ ] Old `routes/auth.routes.js` and `services/{auth,jwt}.service.js` deleted
- [ ] Module contract test passes: importing `index.js` gives the manifest, nothing else is reachable
