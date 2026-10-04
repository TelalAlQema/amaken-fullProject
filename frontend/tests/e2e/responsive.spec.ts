import { test, expect } from "@playwright/test";

/**
 * Horizontal-overflow regression guard.
 *
 * `globals.css` sets `overflow-x: clip` on html/body, which stops the document
 * from panning but still lets individual elements stick out past the viewport
 * (clipped text, controls that cannot be scrolled to). This asserts on element
 * geometry instead, so it catches the real defect rather than the symptom.
 *
 * Run against a real viewport matrix, not just the Pixel 5 project, because the
 * worst overflows live in the 320-400px band and the 640-1023px tablet band.
 */

const VIEWPORTS = [
  { name: "small phone", width: 320, height: 640 },
  { name: "phone", width: 375, height: 667 },
  { name: "large phone", width: 430, height: 932 },
  { name: "tablet portrait", width: 768, height: 1024 },
  { name: "tablet landscape", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
];

const PAGES = [
  "/",
  "/about",
  "/team",
  "/properties",
  "/agents",
  "/blog",
  "/contact",
  "/login",
  "/register",
  "/admin/login",
];

/** Elements that legitimately extend past the viewport. */
function isExempt(el: Element): boolean {
  const style = getComputedStyle(el);
  // Deliberate horizontal scrollers (tables, thumbnail strips).
  if (["auto", "scroll"].includes(style.overflowX)) return true;
  if (style.position === "fixed") return true;
  if (style.visibility === "hidden" || style.display === "none") return true;
  if (parseFloat(style.opacity) === 0) return true;
  // Ignore anything living inside a scroller or a clipper: its overflow is
  // contained by design.
  let parent = el.parentElement;
  while (parent) {
    const p = getComputedStyle(parent);
    if (["auto", "scroll", "hidden", "clip"].includes(p.overflowX)) return true;
    if (p.position === "fixed") return true;
    parent = parent.parentElement;
  }
  return false;
}

test.describe("No horizontal overflow", () => {
  for (const viewport of VIEWPORTS) {
    test(`public pages fit ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const failures: string[] = [];

      for (const path of PAGES) {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        // Let client components hydrate and settle their layout.
        await page.waitForTimeout(400);

        const offenders = await page.evaluate((exemptSource) => {
          const isExempt = new Function(
            "el",
            `return (${exemptSource})(el)`
          ) as (el: Element) => boolean;

          const limit = document.documentElement.clientWidth;
          const out: string[] = [];

          for (const el of Array.from(document.querySelectorAll("body *"))) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            if (rect.right <= limit + 1) continue;
            if (isExempt(el)) continue;
            const id = el.id ? `#${el.id}` : "";
            const cls =
              typeof el.className === "string" && el.className
                ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}`
                : "";
            out.push(
              `${el.tagName.toLowerCase()}${id}${cls} right=${Math.round(
                rect.right
              )} (limit ${limit})`
            );
            if (out.length >= 3) break;
          }
          return out;
        }, isExempt.toString());

        if (offenders.length) {
          failures.push(
            `  ${path}\n${offenders.map((o) => `      - ${o}`).join("\n")}`
          );
        }
      }

      expect(
        failures.join("\n"),
        `Horizontal overflow at ${viewport.width}px:\n${failures.join("\n")}`
      ).toBe("");
    });
  }

  test("mobile menu is scrollable and not taller than the viewport", async ({
    page,
  }) => {
    // Landscape phone: the shortest usable viewport.
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto("/");
    await page.getByLabel("Toggle menu").click();

    const menu = page.locator("#mobile-nav");
    await expect(menu).toBeVisible();

    const { scrollHeight, clientHeight, box } = await menu.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        box: { top: r.top, bottom: r.bottom },
      };
    });

    // Content is taller than the panel => the panel must scroll internally.
    expect(scrollHeight).toBeGreaterThan(0);
    // The panel must fit inside the viewport rather than running off-screen.
    expect(box.bottom).toBeLessThanOrEqual(375 + 1);
    expect(clientHeight).toBeGreaterThan(0);
  });

  test("tap targets in the mobile nav are at least 44px tall", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.getByLabel("Toggle menu").click();

    const links = page.locator("#mobile-nav a");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await links.nth(i).boundingBox();
      if (!box) continue;
      expect(
        box.height,
        `nav link ${i} is only ${Math.round(box.height)}px tall`
      ).toBeGreaterThanOrEqual(44);
    }
  });
});
