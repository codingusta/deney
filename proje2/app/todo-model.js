export const STORAGE_KEY = "proje2-todos";
export const DEFAULT_DATA = { version: 1, todos: [], theme: "dark", completionByDay: {}, glass: { transparency: 65, refraction: 60 } };

export function normalizeTodo(todo, index) {
  return {
    ...todo,
    priority: ["low", "medium", "high"].includes(todo.priority) ? todo.priority : "medium",
    dueDate: isDateOnly(todo.dueDate) ? todo.dueDate : "",
    tags: normalizeTags(todo.tags),
    order: Number.isFinite(todo.order) ? todo.order : index,
    analysis: todo.analysis ?? null,
    analysisError: todo.analysisError ?? "",
    analysisAttempted: Boolean(todo.analysisAttempted || todo.analysis || todo.analysisError),
  };
}

export function isDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function normalizeTags(value) {
  return Array.isArray(value) ? parseTags(value.join(" ")) : [];
}

export function parseTags(value) {
  const seen = new Set();
  return value.split(/[\s,]+/).map((tag) => tag.trim().replace(/^#+/, "").replace(/[^\p{L}\p{N}_-]/gu, ""))
    .filter((tag) => {
      const key = tag.toLocaleLowerCase("tr-TR");
      if (!tag || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatDueDate(value) {
  if (!isDateOnly(value)) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

export function readSavedData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(saved)) return { ...DEFAULT_DATA, todos: saved.filter(isValidTodo).map(normalizeTodo) };
    if (saved?.version === 1 && Array.isArray(saved.todos)) {
      return {
        ...DEFAULT_DATA,
        ...saved,
        theme: ["dark", "light"].includes(saved.theme) ? saved.theme : "dark",
        todos: saved.todos.filter(isValidTodo).map(normalizeTodo),
        glass: {
          transparency: Number.isFinite(saved.glass?.transparency) ? Math.min(100, Math.max(0, saved.glass.transparency)) : 65,
          refraction: Number.isFinite(saved.glass?.refraction) ? Math.min(100, Math.max(0, saved.glass.refraction)) : 60,
        },
      };
    }
  } catch {
    return DEFAULT_DATA;
  }
  return DEFAULT_DATA;
}

function isValidTodo(todo) {
  return Boolean(todo) && typeof todo.id === "string" && typeof todo.text === "string" && typeof todo.done === "boolean";
}

export function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function matchesSearch(todo, query) {
  if (!query) return true;
  return [todo.text, ...(todo.tags ?? []), todo.analysis?.category ?? ""]
    .join(" ").toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"));
}

export function reorderVisibleTasks(todos, visibleIds, movedId, targetId, insertAfter = false) {
  const visibleIdSet = new Set(visibleIds);
  const visibleOrder = todos.filter((todo) => visibleIdSet.has(todo.id)).sort((a, b) => a.order - b.order).map((todo) => todo.id);
  const movedIndex = visibleOrder.indexOf(movedId);
  const targetIndex = visibleOrder.indexOf(targetId);
  if (movedIndex < 0 || targetIndex < 0 || movedId === targetId) return todos;
  visibleOrder.splice(movedIndex, 1);
  visibleOrder.splice(visibleOrder.indexOf(targetId) + (insertAfter ? 1 : 0), 0, movedId);
  const fullOrder = todos.slice().sort((a, b) => a.order - b.order).map((todo) => todo.id);
  let nextVisibleIndex = 0;
  const nextIds = fullOrder.map((id) => visibleIdSet.has(id) ? visibleOrder[nextVisibleIndex++] : id);
  const todoById = new Map(todos.map((todo) => [todo.id, todo]));
  return nextIds.map((id, order) => ({ ...todoById.get(id), order }));
}
