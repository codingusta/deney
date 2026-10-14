"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, GripVertical, Tag, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import Button from "./Button";
import { formatDueDate, localDateString, parseTags } from "./todo-model";

function TodoCard({ todo, index, count, previousId, nextId, query, onComplete, onPatch, onDelete, onMove }) {
  const [editing, setEditing] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const pointerSession = useRef(null);
  const cardRef = useRef(null);

  function saveText(value) {
    if (value.trim()) onPatch(todo.id, { text: value.trim() });
    setEditing(false);
  }

  function saveTags(value) {
    onPatch(todo.id, { tags: parseTags(value) });
    setEditingTags(false);
  }

  function startCardDrag(event) {
    if (
      query ||
      event.button !== 0 ||
      event.target.closest("button, input, select, textarea, [role='checkbox'], .task-editor, .tag-editor")
    ) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    pointerSession.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initialRect: rect,
      started: false,
      lastTarget: "",
      tx: 0,
      ty: 0,
    };
    window.addEventListener("pointerup", finishCardDrag, { once: true });
    window.addEventListener("pointercancel", finishCardDrag, { once: true });
  }

  function moveCardDrag(event) {
    const session = pointerSession.current;
    if (!session || session.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - session.startX;
    const deltaY = event.clientY - session.startY;

    if (!session.started) {
      if (Math.hypot(deltaX, deltaY) < 4) return;
      session.started = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {}
      setIsDragging(true);
    }

    event.preventDefault();

    // 1. Omnidirectional drag movement: Card smoothly follows the pointer in X and Y
    const currentRect = event.currentTarget.getBoundingClientRect();
    const desiredX = session.initialRect.left + deltaX;
    const desiredY = session.initialRect.top + deltaY;
    const slotLeft = currentRect.left - session.tx;
    const slotTop = currentRect.top - session.ty;

    const tx = desiredX - slotLeft;
    const ty = desiredY - slotTop;
    session.tx = tx;
    session.ty = ty;

    const tilt = Math.max(-3, Math.min(3, deltaX * 0.04));
    event.currentTarget.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.02) rotate(${tilt}deg)`;
    event.currentTarget.style.zIndex = "50";

    // 2. Proximity and Approach detection:
    const visualCenterY = desiredY + session.initialRect.height / 2;
    const parent = event.currentTarget.parentElement;
    if (!parent) return;
    const cards = Array.from(parent.querySelectorAll("[data-task-id]"));

    const otherCards = cards
      .filter((card) => card !== event.currentTarget)
      .map((card) => {
        const bounds = card.getBoundingClientRect();
        return {
          card,
          id: card.getAttribute("data-task-id"),
          bounds,
          centerY: bounds.top + bounds.height / 2,
        };
      });

    let bestTarget = null;
    let insertAfter = false;

    // Check proximity with other cards
    for (const other of otherCards) {
      const approachTop = other.bounds.top - 12;
      const approachBottom = other.bounds.bottom + 12;
      if (visualCenterY >= approachTop && visualCenterY <= approachBottom) {
        bestTarget = other;
        // Approaches card: shifts to its new place dynamically
        insertAfter = visualCenterY >= other.bounds.top + other.bounds.height * 0.35;
        break;
      }
    }

    if (!bestTarget && otherCards.length > 0) {
      const sorted = otherCards.slice().sort((a, b) =>
        Math.abs(visualCenterY - a.centerY) - Math.abs(visualCenterY - b.centerY)
      );
      const closest = sorted[0];
      if (Math.abs(visualCenterY - closest.centerY) < closest.bounds.height * 1.2) {
        bestTarget = closest;
        insertAfter = visualCenterY >= closest.centerY;
      }
    }

    if (!bestTarget || !bestTarget.id || bestTarget.id === todo.id) return;

    const targetPosition = `${bestTarget.id}:${insertAfter}`;
    if (session.lastTarget === targetPosition) return;
    session.lastTarget = targetPosition;
    onMove(todo.id, bestTarget.id, insertAfter);
  }

  function finishCardDrag(event) {
    if (pointerSession.current?.pointerId !== event.pointerId) return;
    window.removeEventListener("pointerup", finishCardDrag);
    window.removeEventListener("pointercancel", finishCardDrag);
    if (cardRef.current) {
      cardRef.current.style.transform = "";
      cardRef.current.style.zIndex = "";
      try {
        if (cardRef.current.hasPointerCapture(event.pointerId)) {
          cardRef.current.releasePointerCapture(event.pointerId);
        }
      } catch {}
    }
    setIsDragging(false);
    pointerSession.current = null;
  }

  return (
    <motion.li
      ref={cardRef}
      layout={isDragging ? false : "position"}
      transition={{ layout: { type: "spring", stiffness: 300, damping: 28, mass: 0.8 } }}
      className={`todo-card rounded-2xl p-3${todo.done ? " done" : ""}${isDragging ? " is-dragging" : ""}`}
      data-task-id={todo.id}
      onPointerDown={startCardDrag}
      onPointerMove={moveCardDrag}
    >
      <div className="task-main-row">
        <GripVertical className="drag-handle" size={18} aria-hidden="true" />
        <div className="task-content">
          <Checkbox.Root
            id={`todo-${todo.id}`}
            className="task-checkbox"
            checked={todo.done}
            aria-label={`"${todo.text}" tamamlandı`}
            onCheckedChange={(checked) => onComplete(todo.id, checked === true)}
          >
            <Checkbox.Indicator>
              <Check size={16} strokeWidth={3} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          {editing ? (
            <input
              className="task-editor"
              autoFocus
              aria-label="Görevi düzenle"
              defaultValue={todo.text}
              onBlur={(event) => saveText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") saveText(event.currentTarget.value);
                if (event.key === "Escape") setEditing(false);
              }}
            />
          ) : (
            <label
              htmlFor={`todo-${todo.id}`}
              className="task-label"
              title="Düzenlemek için çift tıkla"
              onDoubleClick={(event) => {
                event.preventDefault();
                setEditing(true);
              }}
            >
              {todo.text}
            </label>
          )}
        </div>
        <div className="task-trailing">
          <span className={`priority priority-${todo.priority}`}>
            {{ low: "Düşük", medium: "Orta", high: "Yüksek" }[todo.priority]} öncelik
          </span>
          <div className="order-controls" role="group" aria-label={`"${todo.text}" görev sırası`}>
            <Button
              type="button"
              aria-label={`"${todo.text}" görevini yukarı taşı`}
              disabled={Boolean(query) || index === 0}
              onClick={() => onMove(todo.id, previousId, false)}
            >
              <ArrowUp size={16} />
            </Button>
            <Button
              type="button"
              aria-label={`"${todo.text}" görevini aşağı taşı`}
              disabled={Boolean(query) || index === count - 1}
              onClick={() => onMove(todo.id, nextId, true)}
            >
              <ArrowDown size={16} />
            </Button>
          </div>
        </div>
      </div>
      <div className="task-meta-row">
        {todo.dueDate && (
          <span className={`due-date${!todo.done && todo.dueDate < localDateString() ? " overdue" : ""}`}>
            {!todo.done && todo.dueDate < localDateString() ? "Gecikti · " : "Son tarih · "}
            {formatDueDate(todo.dueDate)}
          </span>
        )}
        <div className="tag-list" aria-label="Görev etiketleri">
          {todo.tags.map((tag) => (
            <span className="tag-chip" key={tag}>
              #{tag}
            </span>
          ))}
          {editingTags ? (
            <input
              className="tag-editor"
              autoFocus
              aria-label="Etiketleri düzenle"
              defaultValue={todo.tags.map((tag) => `#${tag}`).join(" ")}
              onBlur={(event) => saveTags(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") saveTags(event.currentTarget.value);
                if (event.key === "Escape") setEditingTags(false);
              }}
            />
          ) : (
            <Button
              className="tag-edit-button"
              type="button"
              aria-label="Etiketleri düzenle"
              onClick={() => setEditingTags(true)}
            >
              <Tag size={15} />
              <span>Etiketler</span>
            </Button>
          )}
        </div>
        <Button
          className="delete-button"
          type="button"
          aria-label={`"${todo.text}" görevini sil`}
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 size={16} />
          <span>Sil</span>
        </Button>
      </div>
    </motion.li>
  );
}

export default function TodoList({ todos, query, onComplete, onPatch, onDelete, onMove }) {
  return (
    <ul className="todo-list grid gap-2" aria-live="polite" data-search-active={query ? "true" : "false"}>
      {todos.map((todo, index) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          index={index}
          count={todos.length}
          previousId={todos[index - 1]?.id}
          nextId={todos[index + 1]?.id}
          query={query}
          onComplete={onComplete}
          onPatch={onPatch}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </ul>
  );
}
