"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import { ArrowDown, ArrowUp, Check, GripVertical, Tag, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import Button from "./Button";
import { formatDueDate, localDateString, parseTags } from "./todo-model";

function TodoCard({ todo, index, count, previousId, nextId, query, draggedId, onComplete, onPatch, onDelete, onMove }) {
  const [editing, setEditing] = useState(false);
  const [editingTags, setEditingTags] = useState(false);

  function saveText(value) {
    if (value.trim()) onPatch(todo.id, { text: value.trim() });
    setEditing(false);
  }

  function saveTags(value) {
    onPatch(todo.id, { tags: parseTags(value) });
    setEditingTags(false);
  }

  return (
    <li className={`todo-card flex flex-wrap items-center gap-3 rounded-2xl p-3${todo.done ? " done" : ""}`} draggable={!query}
      onDragStart={(event) => { if (!query) { draggedId.current = todo.id; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", todo.id); } }}
      onDragOver={(event) => { if (!query) event.preventDefault(); }}
      onDrop={(event) => { event.preventDefault(); if (!query) { const bounds = event.currentTarget.getBoundingClientRect(); onMove(event.dataTransfer.getData("text/plain") || draggedId.current, todo.id, event.clientY > bounds.top + bounds.height / 2); draggedId.current = ""; } }}>
      <GripVertical className="drag-handle" size={18} aria-hidden="true" />
      <div className="task-content flex min-w-40 flex-1 items-center gap-3">
        <Checkbox.Root id={`todo-${todo.id}`} className="task-checkbox" checked={todo.done} aria-label={`"${todo.text}" tamamlandı`} onCheckedChange={(checked) => onComplete(todo.id, checked === true)}>
          <Checkbox.Indicator><Check size={16} strokeWidth={3} /></Checkbox.Indicator>
        </Checkbox.Root>
        {editing ? <input className="task-editor min-w-0 flex-1" autoFocus aria-label="Görevi düzenle" defaultValue={todo.text} onBlur={(event) => saveText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveText(event.currentTarget.value); if (event.key === "Escape") setEditing(false); }} /> : <label htmlFor={`todo-${todo.id}`} className="task-label flex-1" title="Düzenlemek için çift tıkla" onDoubleClick={(event) => { event.preventDefault(); setEditing(true); }}>{todo.text}</label>}
      </div>
      {todo.dueDate && <span className={`due-date${!todo.done && todo.dueDate < localDateString() ? " overdue" : ""}`}>{!todo.done && todo.dueDate < localDateString() ? "Gecikti · " : "Son tarih · "}{formatDueDate(todo.dueDate)}</span>}
      {todo.analysis?.category && <span className="category-badge">{todo.analysis.category}</span>}
      {todo.analysis?.urgency && <span className={`urgency-badge urgency-${todo.analysis.urgency}`}>{todo.analysis.urgency}</span>}
      <span className={`priority priority-${todo.priority}`}>{{ low: "Düşük", medium: "Orta", high: "Yüksek" }[todo.priority]} öncelik</span>
      <div className="tag-list flex flex-wrap items-center gap-1" aria-label="Görev etiketleri">
        {todo.tags.map((tag) => <span className="tag-chip" key={tag}>#{tag}</span>)}
        {editingTags ? <input className="tag-editor" autoFocus aria-label="Etiketleri düzenle" defaultValue={todo.tags.map((tag) => `#${tag}`).join(" ")} onBlur={(event) => saveTags(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveTags(event.currentTarget.value); if (event.key === "Escape") setEditingTags(false); }} /> : <Button className="tag-edit-button" type="button" aria-label="Etiketleri düzenle" onClick={() => setEditingTags(true)}><Tag size={15} /><span>Etiketler</span></Button>}
      </div>
      <Button className="delete-button" type="button" aria-label={`"${todo.text}" görevini sil`} onClick={() => onDelete(todo.id)}><Trash2 size={16} /><span>Sil</span></Button>
      <div className="order-controls flex gap-1" role="group" aria-label={`"${todo.text}" görev sırası`}>
        <Button type="button" aria-label={`"${todo.text}" görevini yukarı taşı`} disabled={Boolean(query) || index === 0} onClick={() => onMove(todo.id, previousId, false)}><ArrowUp size={16} /></Button>
        <Button type="button" aria-label={`"${todo.text}" görevini aşağı taşı`} disabled={Boolean(query) || index === count - 1} onClick={() => onMove(todo.id, nextId, true)}><ArrowDown size={16} /></Button>
      </div>
    </li>
  );
}

export default function TodoList({ todos, query, onComplete, onPatch, onDelete, onMove }) {
  const draggedId = useRef("");
  return (
    <ul className="todo-list grid gap-2" aria-live="polite" data-search-active={query ? "true" : "false"}>
      {todos.map((todo, index) => <TodoCard key={todo.id} todo={todo} index={index} count={todos.length} previousId={todos[index - 1]?.id} nextId={todos[index + 1]?.id} query={query} draggedId={draggedId} onComplete={onComplete} onPatch={onPatch} onDelete={onDelete} onMove={onMove} />)}
    </ul>
  );
}
