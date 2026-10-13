"use client";

import { Search } from "lucide-react";
import Button from "./Button";

const filters = [["all", "Hepsi"], ["active", "Aktif"], ["completed", "Tamamlanan"]];

export default function TaskToolbar({ remaining, searchQuery, onSearch, statusFilter, onFilter }) {
  return (
    <section className="toolbar flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4" aria-label="Görev araçları">
      <p className="muted m-0 font-semibold">{remaining} görev kaldı</p>
      <label className="search-control relative flex-1">
        <Search className="search-icon" size={17} aria-hidden="true" />
        <span className="sr-only">Görevlerde ara</span>
        <input type="search" role="searchbox" aria-label="Görevlerde ara" placeholder="Görev, #etiket veya kategori ara…" value={searchQuery} onChange={(event) => onSearch(event.target.value)} />
      </label>
      <div className="status-filters flex gap-2" role="group" aria-label="Görev durum filtresi">
        {filters.map(([value, label]) => <Button className={statusFilter === value ? "is-selected" : ""} type="button" aria-pressed={statusFilter === value} key={value} onClick={() => onFilter(value)}>{label}</Button>)}
      </div>
    </section>
  );
}
