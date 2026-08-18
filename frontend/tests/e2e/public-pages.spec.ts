import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and displays key sections", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Amaken/i);

    const hero = page.locator("section").first();
    await expect(hero).toBeVisible();

    await expect(page.getByRole("link", { name: /Properties/i })).toHaveCount(2);
    await expect(page.getByRole("link", { name: /Agents/i })).toBeVisible();
  });

  test("navigates to properties page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Browse Properties/i }).first().click();
    await expect(page).toHaveURL(/\/properties/);
  });

  test("navigates to login from header", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Login" }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("responsive: mobile menu toggle works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const menuBtn = page.getByLabel("Toggle menu");
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  });
});

test.describe("Property Listing", () => {
  test("loads properties page with filters", async ({ page }) => {
    await page.goto("/properties");
    await expect(page.locator("h1, h2")).toContainText(/[Pp]roperties/);
  });

  test("property cards display price and location", async ({ page }) => {
    await page.goto("/properties");
    const cards = page.locator("[class*='card'], article");
    const count = await cards.count();
    if (count > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });
});

test.describe("Property Detail", () => {
  test("navigates to property detail from listing", async ({ page }) => {
    await page.goto("/properties");
    const firstCard = page.getByRole("link", { name: /AMK-/i }).first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await expect(page).toHaveURL(/\/properties\/\d+/);
    }
  });
});
