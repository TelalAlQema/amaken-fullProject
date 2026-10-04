# M04 — Identity modules: users, admins, accounts

- **Status:** pending
- **Depends on:** M03
- **Blocks:** M05, M06

## Goal

Complete the identity cut. These three services are one horizontal concern spread across three files
with three divergent password implementations. They cannot be split cleanly until M03 provides the
pattern.

## Modules

```
src/modules/users/      # profile, avatar, logo, social links, password, deactivate, block
src/modules/admins/     # PIN step, admin login, admin profile, user management
src/modules/accounts/   # DelAccount + RegisterEmail ledgers
```

## Notes per module

### users
- `user.service.js:303,325` writes `prisma.property` on delete/block. That is a cross-module write.
  It stays legal under [ADR 0002](../adr/0002-single-prisma-client-split-schema.md) but must be an
  explicit, commented repository call — not an accident.
- `user.routes.js:221,236` IDOR already fixed in [M00](M00-safety-net.md); keep the regression test.
- `GET /api/users/:id` must stay public — the frontend calls it with no token.

### admins
- `adminLogin` re-implements login against `prisma.admin` instead of sharing `loginUser`, and has
  **diverged**: SHA-1 fallback (`admin.service.js:67`) where auth uses SHA-256. Collapse onto one
  `password.service`.
- The admin PIN step (`POST /api/admin/pin` → `admin_pin_verified`) is a second factor implemented as
  a single-row `Pin` table. Document the limitation; do not redesign it here.
- `admin.service.js:347-348,421-422` run an `await` **inside** a `$transaction` array literal. Each
  call issues a client-side query *and then* the batch, and `?? -1` can attempt a create with
  `id: -1`. Fix: proper `upsert` on a unique email.

### accounts
- Pure ledger CRUD extracted from `admin.service.js:445,461,476`. It exists only because admin user
  management writes to it. Extracting it removes a four-way cross-domain dependency.

### platform/mail
- `email.service.js` moves here as the nodemailer adapter behind a `Mailer` port. Fixed in
  [M00](M00-safety-net.md) to throw `MailDeliveryError` instead of returning `false`.

## Deletions

```bash
git rm src/routes/user.routes.js src/routes/admin.routes.js
git rm src/services/user.service.js src/services/admin.service.js src/services/email.service.js
```

## Verification

```bash
node --test test/modules/users.test.js test/modules/admins.test.js
node --test test/                    # baseline green
node src/index.js
```

## Definition of done

- [ ] One `password.service` — no SHA-1, no SHA-256 fallback, one bcrypt-upgrade path
- [ ] No `admin.service.js` / `user.service.js` files remain
- [ ] `admin.service.js:347` double-query pattern replaced with an upsert
- [ ] `platform/mail` is the only module that imports nodemailer
- [ ] `GET /api/users/:id` still responds without a token
- [ ] M00 baseline green throughout
