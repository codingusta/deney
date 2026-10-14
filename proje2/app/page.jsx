"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import Button from "./Button";
import CompletionChart from "./CompletionChart";
import GlassSettingsPopover from "./GlassSettingsPopover";
import GraphPanel from "./GraphPanel";
import TaskComposer from "./TaskComposer";
import TaskToolbar from "./TaskToolbar";
import TodoList from "./TodoList";
import useTodoApp from "./useTodoApp";

export default function Home() {
  const app = useTodoApp();

  function deleteTodo(id) {
    app.setData((current) => ({ ...current, todos: current.todos.filter((todo) => todo.id !== id) }));
  }

  function toggleTheme() {
    app.setData((current) => ({ ...current, theme: current.theme === "dark" ? "light" : "dark" }));
  }

  return (
    <main className="page-shell mx-auto w-[min(1440px,calc(100%-3rem))] py-10">
      <header className="page-header relative mx-auto mb-7 px-40 text-center">
        <p className="brand">Yapılacaklar</p>
        <h1>Bugün ne yapılacak?</h1>
        <p className="subtitle">Görevlerini ekle, tamamla ve düzenle.</p>
        <div className="header-actions">
          <GlassSettingsPopover glass={app.data.glass} onUpdate={app.setGlassSettings} />
          <Button className="theme-toggle inline-flex items-center gap-2" type="button" aria-label={app.data.theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"} aria-pressed={app.data.theme === "light"} onClick={toggleTheme}>
            {app.data.theme === "dark" ? <><Sun size={17} /> Açık tema</> : <><Moon size={17} /> Koyu tema</>}
          </Button>
        </div>
      </header>

      <div className="app-layout grid items-start gap-4">
        <section className="task-workspace grid min-w-0 gap-3" aria-label="Görev listesi">
          <TaskComposer onAdd={app.addTodo} />
          <TaskToolbar remaining={app.data.todos.filter((todo) => !todo.done).length} searchQuery={app.searchQuery} onSearch={app.setSearchQuery} statusFilter={app.statusFilter} onFilter={app.setStatusFilter} />
          <AnimatePresence mode="wait">{app.error && <motion.p key={app.error} className="error" role="status" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{`Analiz hatası: ${app.error}`}</motion.p>}</AnimatePresence>
          <TodoList todos={app.visibleTodos} query={app.normalizedQuery} onComplete={app.setTodoCompleted} onPatch={app.patchTodo} onDelete={deleteTodo} onMove={app.moveVisibleTodo} />
          {app.data.todos.length === 0 ? <p className="empty">Henüz görev yok. Yukarıdan ekleyebilirsin.</p> : app.visibleTodos.length === 0 && <p className="empty" role="status">{app.normalizedQuery ? "Aramanla eşleşen görev yok." : "Bu filtreyle eşleşen görev yok."}</p>}
        </section>
        <aside className="insights-workspace grid min-w-0 gap-3" aria-label="İlerleme ve analiz">
          <CompletionChart completionByDay={app.data.completionByDay} />
          <GraphPanel graph={app.graph} graphError={app.graphError} trace={app.latestTrace} latestError={app.latestError || app.error} todos={app.data.todos} />
        </aside>
      </div>
    </main>
  );
}
