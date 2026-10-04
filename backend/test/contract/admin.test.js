/**
 * Admin surface contract baseline.
 *
 * Covers the two-step admin login (PIN then email/password), role enforcement,
 * admin-only data access, and the dashboard routes.
 *
 * Two assertions here document KNOWN BUGS and are written to assert the CURRENT
 * behaviour so the suite is green at baseline:
 *   - the PIN gate is client-side only, so it is trivially bypassable
 *   - the frontend calls /api/admin/dashboard/*, but the routes are mounted at
 *     /api/admin/*, so all three dashboard requests 404
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { getApp, resetDatabase, closeDatabase, prisma } = require("../helpers/app");
const {
  createUser,
  createAdmin,
  createPin,
  createProperty,
  createLead,
  createContact,
  createFeedback,
  createAbout,
  createTeamMember,
  createState,
  createCity,
  PASSWORD,
  PIN,
} = require("../helpers/fixtures");
const { adminAccessToken, userAccessToken } = require("../helpers/auth");

function asAdmin(admin) {
  const t = `Bearer ${adminAccessToken(admin.aid, admin.aemail)}`;
  const r = request(getApp());
  return {
    get: (p) => r.get(p).set("Authorization", t),
    put: (p) => r.put(p).set("Authorization", t),
    post: (p) => r.post(p).set("Authorization", t),
    del: (p) => r.delete(p).set("Authorization", t),
  };
}

test.beforeEach(resetDatabase);
test.after(closeDatabase);

// ── POST /api/admin/pin ─────────────────────────────────────────────────────

test("POST /api/admin/pin verifies the PIN and signals the next step", async () => {
  await createPin();

  const res = await request(getApp())
    .post("/api/admin/pin")
    .send({ pin: PIN })
    .expect(200);

  assert.equal(res.body.success, true);
  assert.equal(res.body.data.step, "email_password");
});

test("POST /api/admin/pin rejects a wrong PIN with 401 PIN_INVALID", async () => {
  await createPin();

  const res = await request(getApp())
    .post("/api/admin/pin")
    .send({ pin: "0000" })
    .expect(401);

  assert.equal(res.body.error.code, "PIN_INVALID");
});

test("POST /api/admin/pin returns 500 PIN_NOT_FOUND when no PIN is seeded", async () => {
  const res = await request(getApp())
    .post("/api/admin/pin")
    .send({ pin: PIN })
    .expect(500);

  assert.equal(res.body.error.code, "PIN_NOT_FOUND");
});

// ── POST /api/admin/login ───────────────────────────────────────────────────

test("POST /api/admin/login returns an admin summary and a token pair", async () => {
  await createAdmin();
  await createPin();

  const res = await request(getApp())
    .post("/api/admin/login")
    .send({ email: "test.admin@example.com", password: PASSWORD })
    .expect(200);

  assert.equal(res.body.success, true);
  // Admin shape is `admin: { id, email, name, type, image }` — NOT the user
  // login's flat `user` key, so the two logins are not interchangeable payloads.
  assert.equal(res.body.data.admin.id, 1);
  assert.equal(res.body.data.admin.email, "test.admin@example.com");
  assert.equal(res.body.data.admin.name, "Test Admin");
  assert.ok(res.body.data.accessToken);
  assert.ok(res.body.data.refreshToken);
});

test("POST /api/admin/login lowercases the email before lookup", async () => {
  await createAdmin({ aemail: "mixed.case@example.com" });

  const res = await request(getApp())
    .post("/api/admin/login")
    .send({ email: "MIXED.CASE@example.com", password: PASSWORD })
    .expect(200);

  assert.ok(res.body.data.accessToken);
});

test("POST /api/admin/login rejects a wrong password with 401 AUTH_FAILED", async () => {
  await createAdmin();

  const res = await request(getApp())
    .post("/api/admin/login")
    .send({ email: "test.admin@example.com", password: "Wrong@12345" })
    .expect(401);

  assert.equal(res.body.error.code, "AUTH_FAILED");
});

test("POST /api/admin/login rejects a blocked admin with 403 ACCOUNT_BLOCKED", async () => {
  await createAdmin({ adminblock: 1 });

  const res = await request(getApp())
    .post("/api/admin/login")
    .send({ email: "test.admin@example.com", password: PASSWORD })
    .expect(403);

  assert.equal(res.body.error.code, "ACCOUNT_BLOCKED");
});

test("POST /api/admin/login will not accept a USER credential", async () => {
  await createUser();
  await createAdmin();

  const res = await request(getApp())
    .post("/api/admin/login")
    .send({ email: "test.user@example.com", password: PASSWORD })
    .expect(401);

  assert.equal(res.body.error.code, "AUTH_FAILED");
});

test("SECURITY: admin login needs only email+password — the PIN gate is client-side only", async () => {
  // FIXME(M00.6): the frontend treats the PIN as a mandatory first step, but
  // adminLogin (admin.service.js:39) never checks that the PIN was verified and
  // no server-side state records it. A direct API call skips the PIN entirely.
  // The fixed test asserts that login without PIN verification is rejected.
  await createAdmin();
  await createPin();

  // No POST /api/admin/pin was made before this login.
  const res = await request(getApp())
    .post("/api/admin/login")
    .send({ email: "test.admin@example.com", password: PASSWORD })
    .expect(200);

  assert.ok(res.body.data.accessToken, "full admin token issued without the PIN step");
});

// ── role enforcement ────────────────────────────────────────────────────────

test("Admin routes return 401 without a token", async () => {
  const res = await request(getApp()).get("/api/admin/profile").expect(401);
  assert.equal(res.body.error.code, "AUTH_REQUIRED");
});

test("Admin routes return 403 for a USER token", async () => {
  const user = await createUser();

  const res = await request(getApp())
    .get("/api/admin/profile")
    .set("Authorization", `Bearer ${userAccessToken(user.uid, user.uemail)}`)
    .expect(403);

  assert.equal(res.body.error.code, "FORBIDDEN");
});

// ── profile ─────────────────────────────────────────────────────────────────

test("GET /api/admin/profile returns the admin row", async () => {
  const admin = await createAdmin();

  const res = await asAdmin(admin).get("/api/admin/profile").expect(200);

  assert.equal(res.body.data.aemail, admin.aemail);
});

test("PUT /api/admin/profile updates the admin row", async () => {
  const admin = await createAdmin();

  await asAdmin(admin)
    .put("/api/admin/profile")
    .send({ aname: "Renamed", acity: "Dubai" })
    .expect(200);

  const row = await prisma.admin.findFirst({ where: { aid: admin.aid } });
  assert.equal(row.aname, "Renamed");
  assert.equal(row.acity, "Dubai");
});

// ── user management ─────────────────────────────────────────────────────────

test("GET /api/admin/users returns { users, pagination }", async () => {
  const admin = await createAdmin();
  await createUser();
  await createUser({ uemail: "agent@example.com", utype: "Agent" });

  const res = await asAdmin(admin).get("/api/admin/users?type=User").expect(200);

  assert.ok(Array.isArray(res.body.data.users));
  assert.equal(res.body.data.users.length, 1, "filtered to utype=User");
});

test("GET /api/admin/users/agents and /builders filter by type", async () => {
  const admin = await createAdmin();
  await createUser({ uemail: "a@example.com", utype: "Agent" });
  await createUser({ uemail: "b@example.com", utype: "Builder" });

  const agents = await asAdmin(admin).get("/api/admin/users/agents").expect(200);
  const builders = await asAdmin(admin).get("/api/admin/users/builders").expect(200);

  assert.equal(agents.body.data.users.length, 1);
  assert.equal(agents.body.data.users[0].utype, "Agent");
  assert.equal(builders.body.data.users[0].utype, "Builder");
});

test("PUT /api/admin/users/:id/status drives activate/deactivate/freeze", async () => {
  const admin = await createAdmin();
  const user = await createUser();

  await asAdmin(admin).put(`/api/admin/users/${user.uid}/status`).send({ action: "deactivate" }).expect(200);
  assert.equal((await prisma.user.findFirst({ where: { uid: user.uid } })).deactivate, 0);

  await asAdmin(admin).put(`/api/admin/users/${user.uid}/status`).send({ action: "activate" }).expect(200);
  assert.equal((await prisma.user.findFirst({ where: { uid: user.uid } })).deactivate, 1);

  await asAdmin(admin).put(`/api/admin/users/${user.uid}/status`).send({ action: "freeze" }).expect(200);
  assert.equal((await prisma.user.findFirst({ where: { uid: user.uid } })).adminblock, 1);
});

test("PUT /api/admin/users/:id/status rejects an unknown action with 400", async () => {
  const admin = await createAdmin();
  const user = await createUser();

  const res = await asAdmin(admin)
    .put(`/api/admin/users/${user.uid}/status`)
    .send({ action: "obliterate" })
    .expect(400);

  assert.equal(res.body.error.code, "VALIDATION_ERROR");
});

test("DELETE /api/admin/users/:id DOES write a DelAccount ledger row", async () => {
  const admin = await createAdmin();
  const user = await createUser();

  await asAdmin(admin).del(`/api/admin/users/${user.uid}`).expect(200);

  const ledger = await prisma.delAccount.findFirst({ where: { email: user.uemail } });
  assert.ok(ledger, "admin delete writes a ledger row");
  // Pinned: the ledger lowercases the account type. DelAccount.utype is "user",
  // while User.utype is "User" — so the ledger cannot be joined to User by type
  // without a case fold. M00.6 normalises the casing.
  assert.equal(ledger.type, "delete");
  assert.equal(ledger.utype, "user");
});

// ── properties ──────────────────────────────────────────────────────────────

test("GET /api/admin/properties returns { properties, pagination } including unapproved", async () => {
  const admin = await createAdmin();
  const user = await createUser();
  await createProperty({ uid: user.uid, adminapproval: 1, title: "Approved" });
  await createProperty({ uid: user.uid, adminapproval: 0, title: "Pending" });

  const res = await asAdmin(admin).get("/api/admin/properties").expect(200);

  assert.equal(res.body.data.properties.length, 2, "admin sees unapproved rows");
});

test("GET /api/admin/properties/approval lists only pending rows", async () => {
  const admin = await createAdmin();
  const user = await createUser();
  await createProperty({ uid: user.uid, adminapproval: 1 });
  await createProperty({ uid: user.uid, adminapproval: 0 });

  const res = await asAdmin(admin).get("/api/admin/properties/approval").expect(200);

  assert.equal(res.body.data.properties.length, 1);
});

test("PUT /api/admin/properties/:id/approve sets adminapproval=1", async () => {
  const admin = await createAdmin();
  const user = await createUser();
  const property = await createProperty({ uid: user.uid, adminapproval: 0 });

  await asAdmin(admin).put(`/api/admin/properties/${property.id}/approve`).expect(200);

  assert.equal((await prisma.property.findFirst({ where: { id: property.id } })).adminapproval, 1);
});

test("PUT /api/admin/properties/:id/freeze sets adminblock=1 and release clears it", async () => {
  const admin = await createAdmin();
  const user = await createUser();
  const property = await createProperty({ uid: user.uid });

  await asAdmin(admin).put(`/api/admin/properties/${property.id}/freeze`).expect(200);
  assert.equal((await prisma.property.findFirst({ where: { id: property.id } })).adminblock, 1);

  await asAdmin(admin).put(`/api/admin/properties/${property.id}/release`).expect(200);
  assert.equal((await prisma.property.findFirst({ where: { id: property.id } })).adminblock, 0);
});

test("Admin approve/hide are NOT idempotent-safe: hide and disapprove are the same write", async () => {
  const admin = await createAdmin();
  const user = await createUser();
  const property = await createProperty({ uid: user.uid, adminapproval: 1 });

  // hide and disapprove both write adminapproval: 0 (property.service.js:384-402)
  await asAdmin(admin).put(`/api/admin/properties/${property.id}/disapprove`).expect(200);
  await asAdmin(admin).put(`/api/admin/properties/${property.id}/hide`).expect(200);
  const row = await prisma.property.findFirst({ where: { id: property.id } });
  assert.equal(row.adminapproval, 0);
});

// ── leads ───────────────────────────────────────────────────────────────────

test("GET /api/admin/leads returns { leads, pagination }", async () => {
  const admin = await createAdmin();
  const user = await createUser();
  const property = await createProperty({ uid: user.uid });
  await createLead({ pid: property.id, email: "lead@example.com" });

  const res = await asAdmin(admin).get("/api/admin/leads").expect(200);

  assert.ok(Array.isArray(res.body.data.leads));
  assert.equal(res.body.data.leads[0].email, "lead@example.com");
});

test("GET /api/admin/leads is the only way to read leads without a property id", async () => {
  const admin = await createAdmin();

  await asAdmin(admin).get("/api/admin/leads").expect(200);
  // The public route leaks them, which is the bug pinned in public.test.js.
  const user = await createUser();
  const property = await createProperty({ uid: user.uid });
  await createLead({ pid: property.id });

  const publicRes = await request(getApp()).get(`/api/properties/${property.id}`).expect(200);
  assert.equal(publicRes.body.data.leads.length, 1, "and the public route does too");
});

test("DELETE /api/admin/leads/:id removes the lead", async () => {
  const admin = await createAdmin();
  const user = await createUser();
  const property = await createProperty({ uid: user.uid });
  const lead = await createLead({ pid: property.id });

  await asAdmin(admin).del(`/api/admin/leads/${lead.id}`).expect(200);

  assert.equal(await prisma.propertyLead.findFirst({ where: { id: lead.id } }), null);
});

test("POST /api/admin/leads/bulk-delete removes many leads", async () => {
  const admin = await createAdmin();
  const user = await createUser();
  const property = await createProperty({ uid: user.uid });
  const a = await createLead({ pid: property.id });
  const b = await createLead({ pid: property.id });

  await asAdmin(admin)
    .post("/api/admin/leads/bulk-delete")
    .send({ ids: [a.id, b.id] })
    .expect(200);

  assert.equal(await prisma.propertyLead.count(), 0);
});

test("POST /api/admin/leads/bulk-delete with an empty list is a zod VALIDATION_ERROR", async () => {
  const admin = await createAdmin();

  // Pinned: the route's zod schema rejects the empty array before the service
  // runs, so the service's NO_IDS branch (lead.service.js:64) is unreachable
  // over HTTP. M00.10 reconciles one of the two.
  const res = await asAdmin(admin)
    .post("/api/admin/leads/bulk-delete")
    .send({ ids: [] })
    .expect(400);

  assert.equal(res.body.error.code, "VALIDATION_ERROR");
});

// ── contacts / feedback ─────────────────────────────────────────────────────

test("BUG: GET /api/admin/contacts always 500s (broken dynamic import)", async () => {
  // FIXME(M00.5): admin-property.routes.js:272 does
  //   const { listContacts } = await import("../services/contact.service")
  // ESM import() does NOT apply CJS extension resolution, so this throws
  // ERR_MODULE_NOT_FOUND; the handler forwards it to errorHandler and the admin
  // gets a 500. Contact submissions therefore cannot be listed at all. Same bug
  // on DELETE /api/admin/contacts/:id (line 289). The fixed test asserts 200.
  const admin = await createAdmin();
  await createContact({ email: "prospect@example.com" });

  const res = await asAdmin(admin).get("/api/admin/contacts").expect(500);

  assert.equal(res.body.success, false);
  // The intended contract, currently unreachable:
  //   assert.ok(Array.isArray(res.body.data.contacts));
  //   assert.equal(res.body.data.contacts[0].email, "prospect@example.com");
});

test("BUG: DELETE /api/admin/contacts/:id always 500s (same dynamic import)", async () => {
  const admin = await createAdmin();
  const contact = await createContact();

  await asAdmin(admin).del(`/api/admin/contacts/${contact.id}`).expect(500);

  // Intended: the row is gone.
  assert.ok(await prisma.contact.findFirst({ where: { id: contact.id } }));
});

// ── feedback ────────────────────────────────────────────────────────────────

test("DIVERGENCE: admin feedback lives at /api/feedback/admin/*, not /api/admin/feedback/*", async () => {
  // FIXME(M00.10): feedback.routes.js:130,147 defines /admin/company and
  // /admin/agents under a router mounted at /feedback, so the real paths are
  // /api/feedback/admin/{company,agents}. frontend/lib/redux/api/adminApi.ts:242
  // and :246 call /admin/feedback/company and /admin/feedback/agents, which 404.
  const admin = await createAdmin();
  const user = await createUser();
  await createFeedback({ uid: user.uid });

  // What the frontend actually asks for — 404.
  for (const path of ["/api/admin/feedback/company", "/api/admin/feedback/agents"]) {
    const res = await asAdmin(admin).get(path).expect(404);
    assert.equal(res.body.error.message, "Route not found", `${path} 404s`);
  }

  // What the backend actually serves — works.
  const real = await asAdmin(admin).get("/api/feedback/admin/company").expect(200);
  assert.equal(real.body.success, true);
});

test("GET /api/feedback/admin/company requires the admin role", async () => {
  const user = await createUser();

  const res = await request(getApp())
    .get("/api/feedback/admin/company")
    .set("Authorization", `Bearer ${userAccessToken(user.uid, user.uemail)}`)
    .expect(403);

  assert.equal(res.body.error.code, "FORBIDDEN");
});

test("GET /api/feedback/my returns { feedbacks, pagination }", async () => {
  const user = await createUser();
  await createFeedback({ uid: user.uid });

  const res = await request(getApp())
    .get("/api/feedback/my")
    .set("Authorization", `Bearer ${userAccessToken(user.uid, user.uemail)}`)
    .expect(200);

  // Pinned: the array key is `feedbacks`, plural — inconsistent with
  // { contacts }, { leads }, { properties } elsewhere. M00.10 normalises.
  assert.ok(Array.isArray(res.body.data.feedbacks));
  assert.equal(res.body.data.feedbacks.length, 1);
});

// ── dashboard: the path divergence ──────────────────────────────────────────

test("SECURITY: a user token is refused by the dashboard routes", async () => {
  const user = await createUser();

  const res = await request(getApp())
    .get("/api/admin/stats")
    .set("Authorization", `Bearer ${userAccessToken(user.uid, user.uemail)}`)
    .expect(403);

  assert.equal(res.body.error.code, "FORBIDDEN");
});

test("GET /api/admin/stats returns the stat counters", async () => {
  const admin = await createAdmin();
  await createUser();
  await createProperty({ uid: 1 });

  const res = await asAdmin(admin).get("/api/admin/stats").expect(200);

  assert.equal(res.body.data.userCount, 1);
  assert.equal(res.body.data.totalProperties, 1);
  // The frontend keys off these exact names.
  assert.ok("adminCount" in res.body.data);
  assert.ok("pendingApproval" in res.body.data);
  assert.ok("totalLeads" in res.body.data);
});

test("GET /api/admin/charts returns chart series", async () => {
  const admin = await createAdmin();

  const res = await asAdmin(admin).get("/api/admin/charts").expect(200);

  assert.equal(res.body.success, true);
});

test("GET /api/admin/sidebar-counts returns the nav badge counts", async () => {
  const admin = await createAdmin();

  const res = await asAdmin(admin).get("/api/admin/sidebar-counts").expect(200);

  assert.equal(res.body.success, true);
});

test("DIVERGENCE: the frontend's /api/admin/dashboard/* paths 404", async () => {
  // FIXME(M00.10): frontend/lib/redux/api/adminApi.ts:250-257 calls
  //   /admin/dashboard/stats, /admin/dashboard/charts, /admin/dashboard/sidebar-counts
  // but routes/index.js:44 mounts dashboard.routes.js at /admin and the route
  // paths inside are /stats, /charts, /sidebar-counts. So the real paths are
  // /api/admin/stats etc. and every dashboard panel is currently blank in the
  // admin UI. The stale comments in dashboard.routes.js:12,25,46 claim the
  // /dashboard prefix. M00.10 aliases the paths to match the frontend.
  const admin = await createAdmin();

  for (const path of [
    "/api/admin/dashboard/stats",
    "/api/admin/dashboard/charts",
    "/api/admin/dashboard/sidebar-counts",
  ]) {
    const res = await asAdmin(admin).get(path).expect(404);
    assert.equal(res.body.error.message, "Route not found", `${path} 404s`);
  }

  // …while the unprefixed paths do serve the data.
  const real = await asAdmin(admin).get("/api/admin/stats").expect(200);
  assert.equal(real.body.success, true);
});
