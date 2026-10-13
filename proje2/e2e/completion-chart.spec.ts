import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test("completion transitions accumulate in the browser-local day and survive task deletion", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-13T12:00:00") });
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.setItem("proje2-todos", JSON.stringify({
    version: 1,
    theme: "dark",
    completionByDay: { "2026-10-12": 4 },
    todos: [
      { id: "open", text: "Yeni görev", done: false, order: 0 },
      { id: "legacy-done", text: "Önceden tamamlanmış", done: true, order: 1 },
    ],
  })));
  await page.reload();

  const chart = page.getByRole("region", { name: "Tamamlanma grafiği" });
  await expect(chart).toBeVisible();
  await expect(chart.getByLabel("Günlük tamamlanma dairesel grafiği")).toBeVisible();
  const { today, todayLabel } = await page.evaluate(() => {
    const date = new Date();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { today: key, todayLabel: date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) };
  });
  const dailyValues = chart.getByRole("list", { name: "Günlük tamamlanma değerleri" });
  await expect(dailyValues).toContainText(`${todayLabel}: 0 görev`);
  const taskCheckbox = page.getByRole("checkbox", { name: '"Yeni görev" tamamlandı' });

  await taskCheckbox.check();
  await expect.poll(() => page.evaluate((date) => {
    const data = JSON.parse(localStorage.getItem("proje2-todos") ?? "null");
    return data.completionByDay[date];
  }, today)).toBe(1);
  await expect(dailyValues).toContainText(`${todayLabel}: 1 görev`);

  await page.reload();
  await taskCheckbox.uncheck();
  await taskCheckbox.check();
  await expect.poll(() => page.evaluate((date) => {
    const data = JSON.parse(localStorage.getItem("proje2-todos") ?? "null");
    return data.completionByDay[date];
  }, today)).toBe(2);
  await expect(dailyValues).toContainText(`${todayLabel}: 2 görev`);

  await page.getByRole("button", { name: '"Yeni görev" görevini sil' }).click();
  await expect.poll(() => page.evaluate((date) => {
    const data = JSON.parse(localStorage.getItem("proje2-todos") ?? "null");
    return data.completionByDay[date];
  }, today)).toBe(2);
  await expect(page.getByRole("checkbox", { name: '"Önceden tamamlanmış" tamamlandı' })).toBeChecked();
});

test("completion chart supports 7, 30, and 90 day date ranges", async ({ page }) => {
  await page.goto(baseURL);
  const chart = page.getByRole("region", { name: "Tamamlanma grafiği" });
  const range = chart.getByLabel("Grafik dönemi");

  await expect(range).toHaveValue("7");
  await range.selectOption("30");
  await expect(range).toHaveValue("30");
  await expect(chart.getByText(/Son 30 gün ·/)).toBeVisible();
  await range.selectOption("90");
  await expect(range).toHaveValue("90");
  await expect(chart.getByText(/Son 90 gün ·/)).toBeVisible();
});
