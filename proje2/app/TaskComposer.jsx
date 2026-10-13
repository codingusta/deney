"use client";

import { useState } from "react";
import { CalendarDays, Hash, Plus } from "lucide-react";
import Button from "./Button";

export default function TaskComposer({ onAdd }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    await onAdd({ text, priority, dueDate, tags: tagInput });
    setText(""); setDueDate(""); setTagInput(""); setShowTagInput(false);
  }

  return (
    <form className="composer flex flex-wrap items-center gap-2 rounded-2xl p-3" onSubmit={submit}>
      <label className="sr-only" htmlFor="todo-input">Yeni görev</label>
      <input className="min-w-0 flex-1" id="todo-input" value={text} onChange={(event) => setText(event.target.value)} placeholder="Yeni görev yaz, Enter ile ekle…" maxLength={200} />
      <label className="sr-only" htmlFor="todo-priority">Görev önceliği</label>
      <select id="todo-priority" aria-label="Görev önceliği" value={priority} onChange={(event) => setPriority(event.target.value)}>
        <option value="low">Düşük öncelik</option><option value="medium">Orta öncelik</option><option value="high">Yüksek öncelik</option>
      </select>
      <label className="sr-only" htmlFor="todo-due-date">Son tarih</label>
      <span className="date-entry"><CalendarDays aria-hidden="true" size={17} /><input id="todo-due-date" type="date" aria-label="Son tarih" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></span>
      <Button className="tag-toggle" type="button" aria-label="Etiket girişini aç" aria-expanded={showTagInput} onClick={() => setShowTagInput((value) => !value)}><Hash size={16} /> Etiket Ekle</Button>
      {showTagInput && <input className="tag-input" aria-label="Etiket ekle" placeholder="#iş #kişisel" value={tagInput} onChange={(event) => setTagInput(event.target.value)} />}
      <Button className="submit-button" type="submit"><Plus size={17} /> Ekle</Button>
    </form>
  );
}
