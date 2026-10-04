/**
 * The only file in `modules/auth` that touches Prisma.
 *
 * Every query the module needs and nothing else. There is no business rule here:
 * an `AppError` thrown from this file would be a rule wearing a disguise, because
 * the layer above cannot tell the difference when reviewing a diff.
 *
 * ## Two of these tables are not the module's
 *
 * `DelAccount` and `RegisterEmail` are the ledgers that M04 will extract into
 * `modules/accounts`. Writing them from here is legal under
 * [ADR 0002](../../../docs/adr/0002-single-prisma-client-split-schema.md) — one
 * client, one schema — and it is commented at each call site so a reviewer sees a
 * decision rather than an accident.
 */
const { prisma, withTransaction } = require("../../platform/db/prisma");

/**
 * @param {string} email already lower-cased and trimmed by the service
 * @returns {Promise<object|null>}
 */
function findUserByEmail(email) {
  return prisma.user.findFirst({ where: { uemail: email } });
}

/**
 * @param {number|string} uid
 * @returns {Promise<object|null>}
 */
function findUserById(uid) {
  return prisma.user.findFirst({ where: { uid: Number(uid) } });
}

/**
 * Cross-module read: `del_account` becomes `modules/accounts` in M04.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
function findDeletedAccountByEmail(email) {
  return prisma.delAccount.findFirst({ where: { email } });
}

/**
 * Cross-module read: `register_email` becomes `modules/accounts` in M04.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
function findRegisterEmailByEmail(email) {
  return prisma.registerEmail.findFirst({ where: { email } });
}

/**
 * Creates the user and its ledger row together, or neither.
 *
 * **One transaction, new in M03.** These were two independent writes, so a ledger
 * failure left a live account that no `register_email` row mentioned — and the
 * admin "registered" list, which reads the ledger, would not show a user who
 * demonstrably exists and can log in.
 *
 * @param {object} userData a `user` create payload
 * @param {object} ledgerData a `registerEmail` create payload
 * @returns {Promise<object>} the created user
 */
function createUserWithLedger(userData, ledgerData) {
  return withTransaction(async (tx) => {
    // Cross-module write: `register_email`. Explicit, because it is the accounts
    // module's table, and this is the dependency M04 exists to remove.
    await tx.registerEmail.create({ data: ledgerData });
    return tx.user.create({ data: userData });
  });
}

/**
 * @param {number} uid
 * @returns {Promise<object>}
 */
function markLogin(uid) {
  return prisma.user.update({ where: { uid }, data: { uloginvalue: 1 } });
}

/**
 * Rewrites a stored hash that was verified against a legacy digest, so the upgrade
 * is invisible to the user and happens exactly once per account.
 *
 * @param {number} uid
 * @param {string} hash
 * @returns {Promise<object>}
 */
function upgradePasswordHash(uid, hash) {
  return prisma.user.update({ where: { uid }, data: { upass: hash } });
}

/**
 * Sets a new password **and invalidates every outstanding token** by bumping
 * `tokenVersion`.
 *
 * The bump is the whole reason the claim exists: without it a password reset left
 * a stolen refresh token working for the remaining seven days, which makes "I reset
 * my password because someone had it" a statement with no effect.
 *
 * @param {string} email
 * @param {string} hash
 * @param {string} date ISO string, matching the column's `VarChar(100)` shape
 * @returns {Promise<{count: number}>}
 */
function replacePassword(email, hash, date) {
  return prisma.user.updateMany({
    where: { uemail: email },
    data: { upass: hash, udate: date, tokenVersion: { increment: 1 } },
  });
}

/**
 * @param {string} email already lower-cased and trimmed by the service
 * @returns {Promise<object|null>}
 */
function findAdminByEmail(email) {
  return prisma.admin.findFirst({ where: { aemail: email } });
}

module.exports = {
  findUserByEmail,
  findUserById,
  findDeletedAccountByEmail,
  findRegisterEmailByEmail,
  createUserWithLedger,
  markLogin,
  upgradePasswordHash,
  replacePassword,
  findAdminByEmail,
};