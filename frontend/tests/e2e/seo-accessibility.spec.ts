import { test, expect } from "@playwright/test";

test.describe("SEO & Meta", () => {
  test("homepage has correct meta tags", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.toLowerCase()).toContain("amaken");

    const description = await page.getAttribute('meta[name="description"]', "content");
    expect(description).toBeTruthy();
  });

  test("properties page has meta description", async ({ page }) => {
    await page.goto("/properties");
    const description = await page.getAttribute('meta[name="description"]', "content");
    expect(description).toBeTruthy();
  });
});

test.describe("Accessibility", () => {
  test("all images have alt attributes", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).not.toBeNull();
    }
  });

  test("form inputs have associated labels", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.getByLabel("Email Address");
    await expect(emailInput).toBeVisible();
    const passwordInput = page.getByLabel("Password");
    await expect(passwordInput).toBeVisible();
  });

  test("page has proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    const count = await h1.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("skip-to-content or landmark roles exist", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main, [role='main']");
    const nav = page.locator("nav, [role='navigation']");
    const mainCount = await main.count();
    const navCount = await nav.count();
    expect(mainCount + navCount).toBeGreaterThan(0);
  });
});

test.describe("Performance", () => {
  test("page loads within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(5000);
  });

  test("no console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForTimeout(2000);
    expect(errors.filter((e) => !e.includes("404") && !e.includes("favicon"))).toHaveLength(0);
  });
});

test.describe("Static Pages", () => {
  const pages = [
    { url: "/about", expected: /about/i },
    { url: "/contact", expected: /contact/i },
    { url: "/team", expected: /team/i },
    { url: "/terms", expected: /terms/i },
    { url: "/privacy", expected: /privacy/i },
    { url: "/thank-you", expected: /thank/i },
  ];

  for (const { url, expected } of pages) {
    test(`${url} renders correctly`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator("h1, h2").first()).toBeVisible();
      const headingText = await page.locator("h1, h2").first().textContent();
      expect(headingText?.toLowerCase()).toMatch(expected);
    });
  }
});
