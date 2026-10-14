import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function dragTask(page, sourceId, targetId, targetRatio = 0.8) {
  await page.setViewportSize({ width: 1280, height: 600 });
  const sourceLocator = page.locator(`[data-task-id="${sourceId}"] .task-label`);
  await sourceLocator.scrollIntoViewIfNeeded();
  const initialSource = await sourceLocator.boundingBox();
  if (!initialSource) throw new Error("Sürükleme başlangıç görevi görünür olmalı.");
  await page.evaluate((top) => window.scrollBy(0, top - 120), initialSource.y);
  const source = await sourceLocator.boundingBox();
  const target = await page.locator(`[data-task-id="${targetId}"]`).boundingBox();
  if (!source || !target) throw new Error("Sürükleme görev kartları görünür olmalı.");

  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height * targetRatio, { steps: 24 });
  await page.mouse.up();
}

test("task CRUD persists in the versioned localStorage envelope", async ({ page }) => {
  await page.goto(baseURL);
  await page.getByLabel("Yeni görev").fill("Read the Next.js guide");
  await page.getByLabel("Görev önceliği").selectOption("high");
  await page.getByRole("button", { name: "Ekle", exact: true }).click();

  const task = page.getByText("Read the Next.js guide", { exact: true });
  await expect(task).toBeVisible();
  await task.dblclick();
  const editor = page.getByRole("textbox", { name: "Görevi düzenle" });
  await editor.fill("Read the App Router guide");
  await editor.press("Enter");
  await expect(page.getByText("Read the App Router guide")).toBeVisible();

  const checkbox = page.getByRole("checkbox", { name: '"Read the App Router guide" tamamlandı' });
  await checkbox.check();
  await page.reload();
  await expect(checkbox).toBeChecked();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("proje2-todos") ?? "null"));
  expect(stored.version).toBe(1);
  expect(stored.todos[0].text).toBe("Read the App Router guide");
  expect(stored.todos[0].priority).toBe("high");

  await page.getByRole("button", { name: '"Read the App Router guide" görevini sil' }).click();
  await expect(page.getByText("Henüz görev yok.")).toBeVisible();
});

test("legacy task arrays migrate without losing task fields", async ({ page }) => {
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.setItem("proje2-todos", JSON.stringify([
    {
      id: "legacy-1", text: "Ödev hazırla", done: true, priority: "high", analysis: { category: "okul" },
      analysisError: "", analysisAttempted: true, dueDate: "2026-10-20", tags: ["Okul"], order: 5,
    },
  ])));
  await page.reload();

  await expect(page.getByText("Ödev hazırla")).toBeVisible();
  const migrated = await page.evaluate(() => JSON.parse(localStorage.getItem("proje2-todos") ?? "null"));
  expect(migrated.version).toBe(1);
  expect(migrated.todos[0]).toMatchObject({
    id: "legacy-1", text: "Ödev hazırla", done: true, priority: "high", analysis: { category: "okul" },
    analysisError: "", analysisAttempted: true, dueDate: "2026-10-20", tags: ["Okul"], order: 5,
  });
});

test("new tasks accept a date and normalized hashtag tags, and tags can be edited", async ({ page }) => {
  await page.goto(baseURL);
  await page.getByLabel("Yeni görev").fill("Kitapları iade et");
  await page.getByRole("button", { name: "Etiket girişini aç" }).click();
  const tagInput = page.getByRole("textbox", { name: "Etiket ekle" });
  await tagInput.fill(" #Okul, #okul, #Kitap ");
  await page.getByLabel("Son tarih").fill("2026-10-20");
  await page.getByRole("button", { name: "Ekle", exact: true }).click();

  const todo = page.locator(".todo-card").filter({ hasText: "Kitapları iade et" });
  await expect(todo.getByText("#Okul")).toBeVisible();
  await expect(todo.getByText("#Kitap")).toBeVisible();
  await expect(todo.getByText("#okul", { exact: true })).toHaveCount(0);
  await expect(todo.getByText("20 Eki 2026")).toBeVisible();

  await todo.getByRole("button", { name: "Etiketleri düzenle" }).click();
  const editTags = todo.getByRole("textbox", { name: "Etiketleri düzenle" });
  await editTags.fill("#Kişisel #Ev");
  await editTags.press("Enter");
  await expect(todo.getByText("#Kişisel")).toBeVisible();
  await expect(todo.getByText("#Ev")).toBeVisible();
  await expect(todo.getByText("#Okul")).toHaveCount(0);

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("proje2-todos") ?? "null"));
  expect(stored.todos[0]).toMatchObject({ dueDate: "2026-10-20", tags: ["Kişisel", "Ev"] });
});

test("legacy migration preserves analysis errors and adds date, tags, and order defaults", async ({ page }) => {
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.setItem("proje2-todos", JSON.stringify([
    { id: "legacy-error", text: "Ödev hazırla", done: false, priority: "high", analysis: null, analysisError: "Servis kapalı", analysisAttempted: true },
  ])));
  await page.reload();
  await expect(page.getByText("Ödev hazırla")).toBeVisible();

  const migrated = await page.evaluate(() => JSON.parse(localStorage.getItem("proje2-todos") ?? "null"));
  expect(migrated.todos[0]).toMatchObject({
    id: "legacy-error", text: "Ödev hazırla", done: false, priority: "high",
    analysis: null, analysisError: "Servis kapalı", analysisAttempted: true,
    dueDate: "", tags: [], order: 0,
  });
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toEqual(["proje2-todos"]);
});

test("past due dates are marked overdue only while a task is incomplete", async ({ page }) => {
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.setItem("proje2-todos", JSON.stringify({
    version: 1, theme: "dark", completionByDay: {}, todos: [
      { id: "late-open", text: "Geciken açık", done: false, dueDate: "2020-01-01", tags: [] },
      { id: "late-done", text: "Geciken tamam", done: true, dueDate: "2020-01-01", tags: [] },
      { id: "today-open", text: "Bugün açık", done: false, dueDate: new Date().toLocaleDateString("en-CA"), tags: [] },
    ],
  })));
  await page.reload();

  const openLate = page.locator(".todo-card").filter({ hasText: "Geciken açık" });
  const doneLate = page.locator(".todo-card").filter({ hasText: "Geciken tamam" });
  await expect(openLate.getByText(/Gecikti/)).toBeVisible();
  await expect(doneLate.getByText(/Gecikti/)).toHaveCount(0);
  await expect(page.locator(".todo-card").filter({ hasText: "Bugün açık" }).getByText(/Gecikti/)).toHaveCount(0);
});

test("LangGraph panel renders the API graph, latest trace, and analysis totals", async ({ page }) => {
  await page.goto(baseURL);
  await expect(page.getByRole("region", { name: "LangGraph Paneli" })).toBeVisible();
  await expect(page.getByText(/Akış düğümleri/)).toBeVisible();
  await page.getByLabel("Yeni görev").fill("Acil toplantı hazırla");
  await page.getByRole("button", { name: "Ekle", exact: true }).click();

  const graphPanel = page.getByRole("region", { name: "LangGraph Paneli" });
  await expect(graphPanel.getByText("Toplam analiz", { exact: true })).toBeVisible();
  await expect(graphPanel.getByText("1", { exact: true })).toBeVisible();
  await expect(graphPanel.getByLabel("Son analiz iz kaydı").getByText("kategorile", { exact: true })).toBeVisible();
  await expect(graphPanel.getByText(/iş 1/)).toBeVisible();
  await expect(graphPanel.getByLabel("Son analiz iz kaydı").getByText(/Acil toplantı hazırla/).first()).toBeVisible();
  await expect(graphPanel.getByLabel("Son analiz iz kaydı").getByText(/ms/).first()).toBeVisible();
});

test("analysis failures remain visible in the graph panel while the task is kept", async ({ page }) => {
  await page.route("**/api/analiz", (route) => route.fulfill({ status: 500, json: { error: "Servis kapalı" } }));
  await page.goto(baseURL);
  await page.getByLabel("Yeni görev").fill("Servis kapalı testi");
  await page.getByRole("button", { name: "Ekle", exact: true }).click();

  await expect(page.getByText("Servis kapalı testi")).toBeVisible();
  await expect(page.getByRole("region", { name: "LangGraph Paneli" }).getByText(/Servis kapalı/)).toBeVisible();
});

test("search intersects with status filters across task text, tags, and analysis category", async ({ page }) => {
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.setItem("proje2-todos", JSON.stringify({
    version: 1, theme: "dark", completionByDay: {}, todos: [
      { id: "text-active", text: "Rapor hazırla", done: false, tags: ["iş"], order: 0 },
      { id: "tag-done", text: "Kitapları topla", done: true, tags: ["rapor"], order: 1 },
      { id: "category-active", text: "Sunum hazırla", done: false, tags: ["sunum"], analysis: { category: "iş" }, order: 2 },
      { id: "other-active", text: "Evi süpür", done: false, tags: ["ev"], analysis: { category: "ev" }, order: 3 },
    ],
  })));
  await page.reload();

  const search = page.getByRole("searchbox", { name: "Görevlerde ara" });
  await search.fill("rapor");
  await expect(page.locator(".todo-card")).toHaveCount(2);
  await expect(page.getByText("Rapor hazırla")).toBeVisible();
  await expect(page.getByText("Kitapları topla")).toBeVisible();

  await page.getByRole("button", { name: "Aktif", exact: true }).click();
  await expect(page.locator(".todo-card")).toHaveCount(1);
  await expect(page.getByText("Rapor hazırla")).toBeVisible();
  await expect(page.getByText("Kitapları topla")).toHaveCount(0);
  await expect(page.locator(".todo-list")).toHaveAttribute("data-search-active", "true");

  await page.getByRole("button", { name: "Hepsi", exact: true }).click();
  await search.fill("iş");
  await expect(page.locator(".todo-card")).toHaveCount(2);
  await expect(page.getByText("Rapor hazırla")).toBeVisible();
  await expect(page.getByText("Sunum hazırla")).toBeVisible();

  await page.getByRole("button", { name: "Tamamlanan", exact: true }).click();
  await search.fill("bulunamayacak");
  await expect(page.getByText("Aramanla eşleşen görev yok.")).toBeVisible();
  await expect(page.locator(".todo-card")).toHaveCount(0);
});

test("visible tasks can be reordered without changing hidden task order", async ({ page }) => {
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.setItem("proje2-todos", JSON.stringify({
    version: 1, theme: "dark", completionByDay: {}, todos: [
      { id: "active-a", text: "Aktif A", done: false, order: 0 },
      { id: "done-a", text: "Tamam A", done: true, order: 1 },
      { id: "active-b", text: "Aktif B", done: false, order: 2 },
      { id: "done-b", text: "Tamam B", done: true, order: 3 },
      { id: "active-c", text: "Aktif C", done: false, order: 4 },
    ],
  })));
  await page.reload();
  await page.getByRole("button", { name: "Aktif", exact: true }).click();

  await dragTask(page, "active-a", "active-b");
  await expect(page.locator(".todo-card .task-label")).toHaveText(["Aktif B", "Aktif A", "Aktif C"]);

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("proje2-todos") ?? "null"));
  expect(stored.todos.slice().sort((a, b) => a.order - b.order).map((todo) => todo.text)).toEqual([
    "Aktif B", "Tamam A", "Aktif A", "Tamam B", "Aktif C",
  ]);
  await page.reload();
  await page.getByRole("button", { name: "Aktif", exact: true }).click();
  await expect(page.locator(".todo-card .task-label")).toHaveText(["Aktif B", "Aktif A", "Aktif C"]);
});

test("keyboard controls reorder completed tasks in their filtered list", async ({ page }) => {
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.setItem("proje2-todos", JSON.stringify({
    version: 1, theme: "dark", completionByDay: {}, todos: [
      { id: "open-a", text: "Açık A", done: false, order: 0 },
      { id: "done-a", text: "Tamam A", done: true, order: 1 },
      { id: "open-b", text: "Açık B", done: false, order: 2 },
      { id: "done-b", text: "Tamam B", done: true, order: 3 },
    ],
  })));
  await page.reload();
  await page.getByRole("button", { name: "Tamamlanan", exact: true }).click();

  await page.getByRole("button", { name: '"Tamam A" görevini aşağı taşı' }).click();
  await expect(page.locator(".todo-card .task-label")).toHaveText(["Tamam B", "Tamam A"]);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("proje2-todos") ?? "null"));
  expect(stored.todos.slice().sort((a, b) => a.order - b.order).map((todo) => todo.text)).toEqual([
    "Açık A", "Tamam B", "Açık B", "Tamam A",
  ]);
});

test("search results cannot be dragged to avoid ambiguous reorder", async ({ page }) => {
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.setItem("proje2-todos", JSON.stringify({
    version: 1, theme: "dark", completionByDay: {}, todos: [
      { id: "first", text: "Rapor A", done: false, order: 0 },
      { id: "second", text: "Rapor B", done: false, order: 1 },
    ],
  })));
  await page.reload();
  await page.getByRole("searchbox", { name: "Görevlerde ara" }).fill("rapor");
  await dragTask(page, "first", "second");
  await expect(page.locator(".todo-card .task-label")).toHaveText(["Rapor A", "Rapor B"]);
  await expect(page.locator(".todo-list")).toHaveAttribute("data-search-active", "true");
});

test("all tasks can be reordered by dragging in the Hepsi filter", async ({ page }) => {
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.setItem("proje2-todos", JSON.stringify({
    version: 1, theme: "dark", completionByDay: {}, todos: [
      { id: "first", text: "İlk görev", done: false, order: 0 },
      { id: "second", text: "İkinci görev", done: true, order: 1 },
      { id: "third", text: "Üçüncü görev", done: false, order: 2 },
    ],
  })));
  await page.reload();
  await dragTask(page, "first", "second");
  await expect(page.locator(".todo-card .task-label")).toHaveText(["İkinci görev", "İlk görev", "Üçüncü görev"]);
});
