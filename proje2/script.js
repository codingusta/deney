const STORAGE_KEY = "proje2-todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const counter = document.getElementById("todo-counter");
const clearBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

/** @typedef {{ id: string, text: string, done: boolean }} Todo */

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTodo);
  } catch {
    return [];
  }
}

function isValidTodo(item) {
  return (
    Boolean(item) &&
    typeof item.id === "string" &&
    typeof item.text === "string" &&
    typeof item.done === "boolean"
  );
}

function saveTodos(nextTodos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTodos));
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** @type {Todo[]} */
let todos = loadTodos();
let activeFilter = "all";

function remainingCount() {
  return todos.filter((todo) => !todo.done).length;
}

function getVisibleTodos() {
  if (activeFilter === "active") return todos.filter((todo) => !todo.done);
  if (activeFilter === "completed") return todos.filter((todo) => todo.done);
  return todos;
}

function updateToolbar() {
  const left = remainingCount();
  counter.textContent = `${left} görev kaldı`;
  clearBtn.disabled = !todos.some((todo) => todo.done);
  emptyState.hidden = getVisibleTodos().length > 0;
}

function setFilter(nextFilter) {
  activeFilter = nextFilter;
  filterButtons.forEach((button) => {
    const selected = button.dataset.filter === nextFilter;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  render();
}

function persist() {
  saveTodos(todos);
  render();
}

function createCheckbox(todo) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-check";
  checkbox.checked = todo.done;
  checkbox.setAttribute("aria-label", `"${todo.text}" tamamlandı`);
  checkbox.addEventListener("change", () => {
    todos = todos.map((item) =>
      item.id === todo.id ? { ...item, done: checkbox.checked } : item
    );
    persist();
  });
  return checkbox;
}

function createDeleteButton(todo) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "todo-delete";
  button.textContent = "Sil";
  button.setAttribute("aria-label", `"${todo.text}" görevini sil`);
  button.addEventListener("click", () => {
    todos = todos.filter((item) => item.id !== todo.id);
    persist();
  });
  return button;
}

function cancelEdit() {
  render();
}

function startEdit(todo, item) {
  if (item.querySelector(".todo-edit")) return;

  const editor = document.createElement("input");
  editor.type = "text";
  editor.className = "todo-edit";
  editor.value = todo.text;
  editor.maxLength = 200;
  editor.setAttribute("aria-label", "Görevi düzenle");
  item.querySelector(".todo-text").replaceWith(editor);
  editor.focus();
  editor.select();

  const finish = () => commitEdit(todo, item, editor);
  editor.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finish();
    }
    if (event.key === "Escape") cancelEdit();
  });
  editor.addEventListener("blur", finish);
}

function commitEdit(todo, item, editor) {
  if (!item.contains(editor)) return;
  const nextText = editor.value.trim();
  if (!nextText) {
    cancelEdit();
    return;
  }
  todos = todos.map((entry) =>
    entry.id === todo.id ? { ...entry, text: nextText } : entry
  );
  persist();
}

function createTodoElement(todo) {
  const item = document.createElement("li");
  item.className = `todo-item${todo.done ? " done" : ""}`;
  const label = document.createElement("span");
  label.className = "todo-text";
  label.textContent = todo.text;
  label.title = "Düzenlemek için çift tıkla";
  label.addEventListener("dblclick", () => startEdit(todo, item));
  item.append(createCheckbox(todo), label, createDeleteButton(todo));
  return item;
}

function render() {
  list.replaceChildren(...getVisibleTodos().map(createTodoElement));
  updateToolbar();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos = [{ id: createId(), text, done: false }, ...todos];
  input.value = "";
  persist();
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter || "all"));
});

clearBtn.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.done);
  persist();
});

render();
