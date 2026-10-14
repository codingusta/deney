"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { ArrowDown, ArrowUp, Check, GripVertical, Tag, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Button from "./Button";
import GlassCard from "./GlassCard";
import GlassSceneLayer from "./GlassSceneLayer";
import GlassFilterHost from "./GlassFilterHost";
import { formatDueDate, localDateString, parseTags } from "./todo-model";

// 1. Subclass MouseSensor and TouchSensor to exclude interactive buttons/inputs
export class SmartMouseSensor extends MouseSensor {
  static activators = [
    {
      eventName: "onMouseDown",
      handler: ({ nativeEvent: event }) => {
        if (event.button !== 0) return false;
        const target = event.target;
        if (
          target instanceof Element &&
          target.closest(
            'button, input, textarea, select, a, [data-no-drag], [role="checkbox"], .task-editor, .tag-editor'
          )
        ) {
          return false;
        }
        return true;
      },
    },
  ];
}

export class SmartTouchSensor extends TouchSensor {
  static activators = [
    {
      eventName: "onTouchStart",
      handler: ({ nativeEvent: event }) => {
        const target = event.target;
        if (
          target instanceof Element &&
          target.closest(
            'button, input, textarea, select, a, [data-no-drag], [role="checkbox"], .task-editor, .tag-editor'
          )
        ) {
          return false;
        }
        return true;
      },
    },
  ];
}

// 2. Custom Collision Detection: select closest card strictly by Y-axis center distance
function closestVerticalCenter({ collisionRect, droppableRects, droppableContainers }) {
  if (!collisionRect) return [];
  const activeCenterY = collisionRect.top + collisionRect.height / 2;
  const collisions = [];

  for (const droppableContainer of droppableContainers) {
    const { id } = droppableContainer;
    const rect = droppableRects.get(id);
    if (!rect) continue;

    const targetCenterY = rect.top + rect.height / 2;
    const distanceY = Math.abs(activeCenterY - targetCenterY);

    collisions.push({
      id,
      data: { droppableContainer, value: distanceY },
    });
  }

  return collisions.sort((a, b) => a.data.value - b.data.value);
}

function SortableTodoCard({
  todo,
  index,
  count,
  previousId,
  nextId,
  query,
  onComplete,
  onPatch,
  onDelete,
  onMove,
}) {
  const [editing, setEditing] = useState(false);
  const [editingTags, setEditingTags] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    disabled: Boolean(query),
  });

  function saveText(value) {
    if (value.trim()) onPatch(todo.id, { text: value.trim() });
    setEditing(false);
  }

  function saveTags(value) {
    onPatch(todo.id, { tags: parseTags(value) });
    setEditingTags(false);
  }

  // Smooth spring-like easing transition for reordering items (~300ms)
  const sortableStyle = {
    transform: isDragging
      ? `${CSS.Transform.toString(transform)} scale(1.04) rotate(var(--drag-tilt, 0deg))`
      : CSS.Transform.toString(transform),
    transition: isDragging
      ? undefined
      : transition || "transform 300ms cubic-bezier(0.25, 1, 0.5, 1)",
    zIndex: isDragging ? 50 : undefined,
    userSelect: "none",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
  };

  return (
    <li
      ref={setNodeRef}
      style={sortableStyle}
      className={`todo-card-wrapper list-none ${isDragging ? "is-dragging is-active-dragging" : ""}`}
      data-task-id={todo.id}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      {...attributes}
      role="listitem"
      tabIndex={undefined}
      {...listeners}
    >
      <GlassCard
        className={`todo-card rounded-[26px] p-3 ${todo.done ? "done" : ""} ${
          isDragging ? "is-dragging" : ""
        }`}
        isDragging={isDragging}
        isDone={todo.done}
      >
        <div className="task-main-row">
          <GripVertical
            className="drag-handle"
            size={18}
            aria-hidden="true"
            data-drag-handle="true"
          />
          <div className="task-content">
            <Checkbox.Root
              id={`todo-${todo.id}`}
              className="task-checkbox glass-pill-control"
              checked={todo.done}
              aria-label={`"${todo.text}" tamamlandı`}
              onCheckedChange={(checked) => onComplete(todo.id, checked === true)}
            >
              <Checkbox.Indicator asChild>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="flex items-center justify-center w-full h-full"
                >
                  <Check size={16} strokeWidth={3} />
                </motion.div>
              </Checkbox.Indicator>
            </Checkbox.Root>

            {editing ? (
              <input
                className="task-editor"
                autoFocus
                aria-label="Görevi düzenle"
                style={{ userSelect: "text" }}
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
                className="glass-pill-button"
                aria-label={`"${todo.text}" görevini yukarı taşı`}
                disabled={Boolean(query) || index === 0}
                onClick={() => onMove(todo.id, previousId, false)}
              >
                <ArrowUp size={16} />
              </Button>
              <Button
                type="button"
                className="glass-pill-button"
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
            <span
              className={`due-date${!todo.done && todo.dueDate < localDateString() ? " overdue" : ""}`}
            >
              {!todo.done && todo.dueDate < localDateString() ? "Gecikti · " : "Son tarih · "}
              {formatDueDate(todo.dueDate)}
            </span>
          )}
          <div className="tag-list" aria-label="Görev etiketleri">
            {todo.tags.map((tag) => (
              <span className="tag-chip glass-pill-chip" key={tag}>
                #{tag}
              </span>
            ))}
            {editingTags ? (
              <input
                className="tag-editor"
                autoFocus
                aria-label="Etiketleri düzenle"
                style={{ userSelect: "text" }}
                defaultValue={todo.tags.map((tag) => `#${tag}`).join(" ")}
                onBlur={(event) => saveTags(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveTags(event.currentTarget.value);
                  if (event.key === "Escape") setEditingTags(false);
                }}
              />
            ) : (
              <Button
                className="tag-edit-button glass-pill-button"
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
            className="delete-button glass-pill-button"
            type="button"
            aria-label={`"${todo.text}" görevini sil`}
            onClick={() => onDelete(todo.id)}
          >
            <Trash2 size={16} />
            <span>Sil</span>
          </Button>
        </div>
      </GlassCard>
    </li>
  );
}

export default function TodoList({ todos, query, onComplete, onPatch, onDelete, onMove }) {
  const [activeId, setActiveId] = useState(null);
  const tiltCleanupRef = useRef(null);
  const selectCleanupRef = useRef(null);

  // Setup sensors with SmartMouseSensor, SmartTouchSensor, KeyboardSensor
  const sensors = useSensors(
    useSensor(SmartMouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(SmartTouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);

    // Deselect any selected text & block selection during drag
    window.getSelection()?.removeAllRanges();
    document.body.classList.add("is-dragging");

    const preventSelection = (e) => e.preventDefault();
    document.addEventListener("selectstart", preventSelection);
    selectCleanupRef.current = () => document.removeEventListener("selectstart", preventSelection);

    // Track horizontal speed to compute dynamic tilt (±3deg) via CSS variable
    let lastX = 0;
    let lastTime = 0;
    const onPointerMove = (e) => {
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 16 && lastTime > 0) {
        const vx = (e.clientX - lastX) / dt; // px per ms
        const tilt = Math.max(-3, Math.min(3, vx * 3.2));
        const activeCard = document.querySelector(".is-active-dragging");
        if (activeCard) {
          activeCard.style.setProperty("--drag-tilt", `${tilt.toFixed(1)}deg`);
        }
      }
      lastX = e.clientX;
      lastTime = now;
    };

    window.addEventListener("pointermove", onPointerMove);
    tiltCleanupRef.current = () => {
      window.removeEventListener("pointermove", onPointerMove);
      const activeCard = document.querySelector(".is-active-dragging");
      if (activeCard) activeCard.style.setProperty("--drag-tilt", "0deg");
    };
  }, []);

  const handleDragOver = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeIndex = todos.findIndex((t) => t.id === active.id);
      const overIndex = todos.findIndex((t) => t.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const insertAfter = activeIndex < overIndex;
        onMove(active.id, over.id, insertAfter);
      }
    },
    [todos, onMove]
  );

  const cleanupDrag = useCallback(() => {
    setActiveId(null);
    document.body.classList.remove("is-dragging");
    selectCleanupRef.current?.();
    tiltCleanupRef.current?.();
  }, []);

  const handleDragEnd = useCallback(() => {
    cleanupDrag();
  }, [cleanupDrag]);

  const handleDragCancel = useCallback(() => {
    cleanupDrag();
  }, [cleanupDrag]);

  return (
    <div className="todo-list-container relative min-w-0">
      {/* Background scene layer to bend and refract through the glass bezels */}
      <GlassSceneLayer />

      {/* SVG host for dynamically cached displacement maps */}
      <GlassFilterHost />

      <DndContext
        id="todo-dnd-context"
        sensors={sensors}
        collisionDetection={closestVerticalCenter}
        modifiers={[restrictToWindowEdges]}
        autoScroll={{ threshold: { x: 0, y: 0.15 } }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <ul
            className="todo-list relative z-10 grid gap-3 p-0 m-0"
            aria-live="polite"
            data-search-active={query ? "true" : "false"}
          >
            {todos.map((todo, index) => (
              <SortableTodoCard
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
        </SortableContext>
      </DndContext>
    </div>
  );
}
