import { test, expect } from "@playwright/test";

test.describe("Admin Login", () => {
  test("PIN login page renders", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("input")).toBeVisible();
    await expect(page.getByRole("button", { name: /verify|submit|login/i })).toBeVisible();
  });

  test("admin dashboard redirects when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("admin email login page renders", async ({ page }) => {
    await page.goto("/admin/login/email");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});

test.describe("Admin Pages Guard", () => {
  const adminPages = [
    "/admin/properties",
    "/admin/users",
    "/admin/states",
    "/admin/cities",
    "/admin/contacts",
    "/admin/leads",
    "/admin/about",
    "/admin/team",
  ];

  for (const adminPage of adminPages) {
    test(`redirects unauthenticated from ${adminPage}`, async ({ page }) => {
      await page.goto(adminPage);
      await expect(page).toHaveURL(/\/admin\/login/);
    });
  }
});
