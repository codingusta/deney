import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test("dark is the default and the theme toggle persists light mode in the existing envelope", async ({ page }) => {
  await page.goto(baseURL);
  const toggle = page.getByRole("button", { name: "Açık temaya geç" });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Koyu temaya geç" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("body")).toHaveCSS("color-scheme", "light");
  await expect(page.locator("body")).toHaveCSS("color", "rgb(23, 36, 43)");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("proje2-todos") ?? "null").theme)).toBe("light");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Koyu temaya geç" })).toBeVisible();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toEqual(["proje2-todos"]);
});

test("the desktop layout uses two columns and frosted panels", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(baseURL);

  const layout = await page.locator(".app-layout").evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(layout.split(" ")).toHaveLength(2);
  const glass = await page.locator(".composer").evaluate((element) => ({
    border: getComputedStyle(element).getPropertyValue("border-top-color"),
    background: getComputedStyle(element).backgroundColor,
    blurSupported: CSS.supports("backdrop-filter", "blur(18px)"),
    filter: getComputedStyle(element).getPropertyValue("backdrop-filter"),
  }));
  expect(glass.blurSupported).toBe(true);
  expect(glass.filter).toContain("blur");
  expect(glass.background).toMatch(/^rgba\(/);
  expect(glass.border).not.toBe("rgba(0, 0, 0, 0)");
  await expect(page.getByText("Yapılacaklar", { exact: true })).toHaveCSS("text-align", "center");
});

test("mobile stacks the app and keeps controls accessible without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL);

  const layout = await page.locator(".app-layout").evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(layout.split(" ")).toHaveLength(1);
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.getByRole("button", { name: "Açık temaya geç" })).toHaveCSS("min-height", "44px");
  await expect(page.getByRole("button", { name: "Açık temaya geç" })).toHaveAttribute("aria-pressed", "false");
});

test("reduced motion preference removes decorative transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(baseURL);

  const duration = await page.locator(".theme-toggle").evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(duration.split(",").every((value) => Number.parseFloat(value) <= 0.01)).toBe(true);
});
