import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Passcode").fill("pilot");
  await page.getByRole("button", { name: "Enter studio" }).click();
  await expect(page.getByRole("heading", { name: "Calling Card Studio" })).toBeVisible();
});

test("creates, generates, accepts, manipulates, and recovers a local calling card", async ({ page }) => {
  await page.getByLabel("Message").fill("Meet me where the stars begin.");
  await page.getByLabel("Signature").fill("Aster");
  await page.getByRole("button", { name: /emblem/i }).first().click();
  await page.getByRole("button", { name: "Generate", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Accept candidate" }).click();
  await expect(page.getByText("emblem accepted into the local asset library.")).toBeVisible();
  await page.getByRole("slider", { name: "Opacity" }).fill("0.6");
  await expect(page.getByText("Valid v0.1.0")).toBeVisible();
  await expect(page.getByText("Saved locally")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Message")).toHaveValue("Meet me where the stars begin.");
  await expect(page.getByLabel("Signature")).toHaveValue("Aster");
});

test("supports batch review, rejection, reduced motion, and keyboard inspector controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Generate all missing" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Accept candidate" }).click();
  await page.keyboard.press("Tab");
  await expect(page.getByText(/Batch:/)).toBeVisible();
});

test("uploads, edits, exports, resets, and re-imports a portable card", async ({ page }) => {
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  await page.getByRole("button", { name: /Background Missing/i }).click();
  await page.getByLabel("Upload background image").setInputFiles({
    name: "background.png", mimeType: "image/png", buffer: pixel,
  });
  await page.getByRole("button", { name: /Texture Missing/i }).click();
  await page.getByLabel("Upload texture image").setInputFiles({
    name: "texture.png", mimeType: "image/png", buffer: pixel,
  });
  await page.getByRole("checkbox", { name: /background · upload/i }).check();
  await page.getByRole("button", { name: "Edit current image" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Reject" }).click();

  const pngDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG" }).click();
  expect((await pngDownload).suggestedFilename()).toBe("calling-card.png");

  const zipDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export ZIP" }).click();
  const zip = await zipDownload;
  const zipPath = await zip.path();
  expect(zipPath).toBeTruthy();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset local project" }).click();
  await page.getByLabel("Import portable ZIP").setInputFiles(zipPath!);
  await expect(page.getByText("Portable project imported.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Background Asset bound/i })).toBeVisible();
});

test("has no serious accessibility violations at the access-controlled editor", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});
