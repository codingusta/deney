"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_DATA, STORAGE_KEY, localDateString, matchesSearch, newId, normalizeTodo, parseTags, readSavedData, reorderVisibleTasks } from "./todo-model";

export default function useTodoApp() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [ready, setReady] = useState(false);
  const [graph, setGraph] = useState(null);
  const [graphError, setGraphError] = useState("");
  const [latestTrace, setLatestTrace] = useState([]);
  const [latestError, setLatestError] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const saved = readSavedData();
    const latest = saved.todos.find((todo) => todo.analysisAttempted);
    setData(saved);
    setLatestTrace(latest?.analysis?.trace ?? []);
    setLatestError(latest?.analysisError ?? "");
    setError(latest?.analysisError ?? "");
    setReady(true);
    fetch("/api/graf").then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Graf bilgisi alınamadı.");
      setGraph(result);
    }).catch((cause) => setGraphError(cause instanceof Error ? cause.message : "Graf servisine ulaşılamadı."));
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  useEffect(() => { document.documentElement.dataset.theme = data.theme; }, [data.theme]);

  function patchTodo(id, patch) {
    setData((current) => ({ ...current, todos: current.todos.map((todo) => todo.id === id ? { ...todo, ...patch } : todo) }));
  }

  function setTodoCompleted(id, completed) {
    setData((current) => {
      const todo = current.todos.find((item) => item.id === id);
      if (!todo || todo.done === completed) return current;
      if (!completed) return { ...current, todos: current.todos.map((item) => item.id === id ? { ...item, done: false } : item) };
      const today = localDateString();
      return {
        ...current,
        completionByDay: { ...current.completionByDay, [today]: (Number(current.completionByDay?.[today]) || 0) + 1 },
        todos: current.todos.map((item) => item.id === id ? { ...item, done: true } : item),
      };
    });
  }

  function moveVisibleTodo(movedId, targetId, insertAfter = false) {
    setData((current) => ({ ...current, todos: reorderVisibleTasks(current.todos, visibleTodos.map((todo) => todo.id), movedId, targetId, insertAfter) }));
  }

  async function addTodo({ text, priority, dueDate, tags }) {
    const taskText = text.trim();
    if (!taskText) return;
    const nextOrder = data.todos.length ? Math.min(...data.todos.map((todo) => todo.order)) - 1 : 0;
    const todo = normalizeTodo({ id: newId(), text: taskText, done: false, priority, dueDate, tags: parseTags(tags), analysisAttempted: true, order: nextOrder }, data.todos.length);
    setData((current) => ({ ...current, todos: [todo, ...current.todos] }));
    setError(""); setLatestTrace([]); setLatestError("");
    try {
      const response = await fetch("/api/analiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task_text: taskText }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Görev analiz edilemedi.");
      patchTodo(todo.id, { analysis: result, text: result.cleaned_text || taskText });
      setLatestTrace(result.trace ?? []);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Analiz servisine ulaşılamadı.";
      patchTodo(todo.id, { analysisError: message }); setError(message); setLatestError(message);
    }
  }

  const normalizedQuery = searchQuery.trim();
  const visibleTodos = useMemo(() => data.todos.slice().sort((a, b) => a.order - b.order).filter((todo) => {
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" && !todo.done) || (statusFilter === "completed" && todo.done);
    return matchesStatus && matchesSearch(todo, normalizedQuery);
  }), [data.todos, normalizedQuery, statusFilter]);

  return {
    data, setData, error, graph, graphError, latestTrace, latestError, searchQuery, setSearchQuery, statusFilter, setStatusFilter,
    normalizedQuery, visibleTodos, addTodo, patchTodo, setTodoCompleted, moveVisibleTodo,
  };
}
