/**
 * Module registration.
 *
 * The composition root. `src/app.js` hands its router to {@link registerModules} and
 * gets the un-mounted routers back, so adding a module is one line in
 * {@link MODULES} and one line in `src/app.js` — not a `require` inside a route file,
 * which is how `routes/auth.routes.js` came to import its service before this existed.
 *
 * ## Why a list rather than a scan of `src/modules`
 *
 * A directory scan would make the route table depend on the filesystem, so a
 * leftover directory would silently add endpoints and a rename would silently remove
 * them. `test/contract/route-parity.test.js` pins the whole table; that test is only
 * meaningful if the table is written down somewhere.
 *
 * ## Order
 *
 * Modules are mounted in declaration order, and the order is the order they appear
 * in the M00 route parity baseline. It matters in one place today — `catch-all` and
 * `notFound` must come last — and it will matter for any module that mounts a
 * wildcard.
 */

/**
 * The registry. One entry per module.
 *
 * M03 moves exactly one module here. The other twelve route files stay mounted by
 * `src/routes/index.js` until their own milestone: migrating them is not this
 * milestone's to do, and a half-migrated tree where some modules are registered and
 * some are hand-mounted is the state where nobody can answer "where is this
 * endpoint declared?".
 *
 * @type {{ name: string, mounts: { path: string, router: import("express").Router, guards: import("express").RequestHandler[] }[] }[]}
 */
const MODULES = [require("../modules/auth")];

/**
 * Mounts every module's routers onto `target`.
 *
 * @param {import("express").Router} target
 * @param {typeof MODULES} [modules]
 * @returns {import("express").Router} `target`, for chaining
 */
function registerModules(target, modules = MODULES) {
  for (const module of modules) {
    for (const mount of module.mounts) {
      // Guards first, so a module that declares one cannot accidentally run its
      // handler before the guard: `router.use(path, ...guards, router)` evaluates
      // left to right, and putting the router last is what makes that true.
      target.use(mount.path, ...mount.guards, mount.router);
    }
  }

  return target;
}

module.exports = { registerModules, MODULES };