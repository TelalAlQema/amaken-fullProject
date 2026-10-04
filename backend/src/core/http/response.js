/**
 * The response envelope ([ADR 0003](../../../docs/adr/0003-canonical-envelope.md)).
 *
 * Every endpoint returns:
 *
 *     { success: true, data: … }
 *     { success: true, data: { items: [...], pagination: {...} } }
 *     { success: false, error: { message, code? } }
 *
 * `res.json({ success: true, data: x })` is written by hand ~70 times today and
 * every one of them is a chance to invent a key. Routes call `res.ok(data)`
 * instead.
 *
 * Three responses are deliberately *not* enveloped and are not routed through
 * this module: the leads TSV export (`raw`, still enveloped enough for its
 * consumer), `/health`, and `GET /api`.
 */

/** @typedef {{ success: true, data: unknown }} SuccessBody */
/** @typedef {{ success: false, error: { message: string, code?: string, details?: unknown } }} ErrorBody */

/** True when the client should keep the legacy named key alongside `items`. */
function legacyKeyEnabled(flag) {
  return flag !== false;
}

/**
 * 200 — `{ success: true, data }`.
 *
 * @param {import("express").Response} res
 * @param {unknown} [data]
 */
function ok(res, data) {
  res.status(200).json({ success: true, data: data === undefined ? null : data });
}

/**
 * 201 — identical body to {@link ok}. Split from it so the intent survives in
 * the source and a future `Location` header has somewhere to go.
 *
 * @param {import("express").Response} res
 * @param {unknown} [data]
 */
function created(res, data) {
  res.status(201).json({ success: true, data: data === undefined ? null : data });
}

/**
 * 204, no body. Used by `DELETE /users/me/avatar` and `.../logo`.
 *
 * @param {import("express").Response} res
 */
function noContent(res) {
  res.status(204).end();
}

/**
 * 200 — the canonical list envelope.
 *
 * @param {import("express").Response} res
 * @param {object} params
 * @param {unknown[]} params.items
 * @param {{ page: number, limit: number, total: number, totalPages: number }} params.pagination
 * @param {string} [params.legacyKey] pre-M07 key, e.g. `"properties"`. Emitted
 *   only while the envelope flag is on, so the frontend can migrate before the
 *   alias is deleted.
 * @param {boolean} [params.legacyKeyEnabled] per-call override of the flag.
 */
function paginated(res, { items = [], pagination, legacyKey, legacyKeyEnabled: flag = true } = {}) {
  const data = { items, pagination };
  if (legacyKey && legacyKeyEnabled(flag) && legacyKey !== "items") {
    data[legacyKey] = items;
  }
  res.status(200).json({ success: true, data });
}

/**
 * 200 with a caller-built body, for the endpoints that are not enveloped.
 *
 * Currently one: the leads TSV export, which the frontend consumes as a `Blob`.
 * The name is deliberately blunt — it says "I know I am opting out".
 *
 * @param {import("express").Response} res
 */
function raw(res) {
  res.status(200);
}

/**
 * The error half of the envelope, used by the global errorHandler.
 *
 * @param {import("express").Response} res
 * @param {number} status
 * @param {string} message
 * @param {string} [code]
 * @param {unknown} [details]
 */
function fail(res, status, message, code, details) {
  res.status(status).json({
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details !== undefined && { details }),
    },
  });
}

/**
 * Express middleware that decorates `res` with the bound helpers, so a route
 * reads `res.ok(x)` rather than `ok(res, x)`. Registered once in `src/app.js`.
 *
 * It also sets `res.locals.paginate` to nothing on purpose: pagination is a
 * service concern ([`core/http/pagination.js`](./pagination.js)), not a
 * response concern.
 *
 * @type {import("express").RequestHandler}
 */
function envelope() {
  return (_req, res, next) => {
    res.ok = (data) => ok(res, data);
    res.created = (data) => created(res, data);
    res.noContent = () => noContent(res);
    res.paginated = (params) => paginated(res, params);
    res.raw = () => raw(res);
    res.fail = (status, message, code, details) => fail(res, status, message, code, details);
    next();
  };
}

module.exports = { ok, created, noContent, paginated, raw, fail, envelope };
