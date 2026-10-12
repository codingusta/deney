const STORAGE_KEY = "proje2-todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const meta = document.getElementById("todo-meta");

/** @typedef {{ id: string, text: string, done: boolean }} Todo */

/** @returns {Todo[]} */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.text === "string" &&
        typeof item.done === "boolean"
    );
  } catch {
    return [];
  }
}

/** @param {Todo[]} todos */
function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/** @type {Todo[]} */
let todos = loadTodos();

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function updateMeta() {
  if (todos.length === 0) {
    meta.hidden = true;
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  const doneCount = todos.filter((t) => t.done).length;
  meta.hidden = false;
  meta.textContent = `${todos.length} görev · ${doneCount} tamamlandı`;
}

/** @param {Todo} todo */
function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = `todo-item${todo.done ? " done" : ""}`;
  li.dataset.id = todo.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-check";
  checkbox.checked = todo.done;
  checkbox.setAttribute("aria-label", "Tamamlandı olarak işaretle");

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "todo-delete";
  deleteBtn.textContent = "Sil";
  deleteBtn.setAttribute("aria-label", `"${todo.text}" görevini sil`);

  checkbox.addEventListener("change", () => {
    todos = todos.map((t) =>
      t.id === todo.id ? { ...t, done: checkbox.checked } : t
    );
    saveTodos(todos);
    li.classList.toggle("done", checkbox.checked);
    updateMeta();
  });

  deleteBtn.addEventListener("click", () => {
    todos = todos.filter((t) => t.id !== todo.id);
    saveTodos(todos);
    li.remove();
    updateMeta();
  });

  li.append(checkbox, text, deleteBtn);
  return li;
}

function render() {
  list.replaceChildren(...todos.map(createTodoElement));
  updateMeta();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const todo = { id: createId(), text, done: false };
  todos = [todo, ...todos];
  saveTodos(todos);

  list.prepend(createTodoElement(todo));
  updateMeta();

  input.value = "";
  input.focus();
});

render();
