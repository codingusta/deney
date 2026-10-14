import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test("held pointer reorders tasks live with a fully opaque moving card and animated layout", async ({ page }) => {
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.setItem("proje2-todos", JSON.stringify({
    version: 1,
    theme: "dark",
    completionByDay: {},
    todos: [
      { id: "task-a", text: "İlk görev", done: false, order: 0 },
      { id: "task-b", text: "İkinci görev", done: false, order: 1 },
      { id: "task-c", text: "Üçüncü görev", done: false, order: 2 },
    ],
  })));
  await page.reload();

  const firstLabel = page.locator('[data-task-id="task-a"] .task-label');
  const targetCard = page.locator('[data-task-id="task-b"]');
  const start = await firstLabel.boundingBox();
  const target = await targetCard.boundingBox();
  if (!start || !target) throw new Error("Sürükleme görev kartları görünür olmalı.");

  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height * 0.8, { steps: 5 });

  await expect(page.locator(".todo-card .task-label")).toHaveText(["İkinci görev", "İlk görev", "Üçüncü görev"]);
  const dragState = await page.locator('[data-task-id="task-a"]').evaluate((element) => ({
    opacity: getComputedStyle(element).opacity,
    transform: getComputedStyle(element).transform,
    dragging: element.classList.contains("is-dragging"),
  }));
  expect(dragState.opacity).toBe("1");
  expect(dragState.dragging).toBe(true);
  expect(dragState.transform).not.toBe("none");

  await page.mouse.up();
  await expect(page.locator('[data-task-id="task-a"]')).not.toHaveClass(/is-dragging/);
});
