import { test, expect } from "@playwright/test";

const TEST_USER = {
  email: `testuser_${Date.now()}@example.com`,
  password: "TestP@ssw0rd!",
  name: "Test",
  lastname: "User",
  phone: "551234567",
};

test.describe("Auth Flow", () => {
  test("login page renders with form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /Login/i })).toBeVisible();
  });

  test("login shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email Address").fill("nonexistent@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /Login/i }).click();

    await expect(page.locator("[class*='red']")).toBeVisible({ timeout: 10000 });
  });

  test("forgot password link is present and navigable", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Forgot password/i }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("register link is present on login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /Register now/i })).toBeVisible();
  });

  test("registration page renders", async ({ page }) => {
    await page.goto("/verify-email");
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
  });
});

test.describe("Auth Redirects", () => {
  test("unauthenticated user redirected from profile", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user redirected from submit-property", async ({ page }) => {
    await page.goto("/submit-property");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user redirected from my-properties", async ({ page }) => {
    await page.goto("/my-properties");
    await expect(page).toHaveURL(/\/login/);
  });
});
