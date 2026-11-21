import { expect, test } from "@playwright/test";

// Runs against the demonstration data. Start with: npm run e2e (it launches the dev server).
test("register, search, compare the checkbox, accept, and open the shipment", async ({ page }) => {
  const email = `driver${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Your name").fill("Test Driver");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("long-enough-password");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: "Find cargo for your onward trip" })).toBeVisible();

  // Off-route stops are off by default
  const toggle = page.getByRole("checkbox", { name: /off-route pickups and drops/i });
  await expect(toggle).not.toBeChecked();

  await page.getByRole("button", { name: "Find cargo" }).click();
  const eligibleTab = page.getByRole("tab", { name: /Eligible/ });
  await expect(eligibleTab).toBeVisible();
  const withoutOffRoute = await eligibleTab.textContent();

  await toggle.check();
  await page.getByRole("button", { name: "Search again" }).click();
  await expect(eligibleTab).not.toHaveText(withoutOffRoute ?? "");

  // Open the first eligible job and accept it
  await page.getByRole("link", { name: "Details" }).first().click();
  await page.getByRole("button", { name: "Accept this job" }).click();
  await page.getByRole("button", { name: "Yes, accept" }).click();

  await expect(page.getByRole("link", { name: "Open in Google Maps" })).toHaveAttribute("href", /google\.com\/maps\/dir/);
  await page.getByRole("button", { name: /Move to:/ }).click();
  await expect(page.getByText("Heading to pickup").first()).toBeVisible();

  await page.getByRole("button", { name: /Sign out/ }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
