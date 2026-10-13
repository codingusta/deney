"use client";

import { useMemo, useState } from "react";
import { Cell, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";

const RANGES = [7, 30, 90];

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateLabel(date) {
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function buildDailySeries(completionByDay, range, now = new Date()) {
  return Array.from({ length: range }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (range - index - 1));
    const key = localDateKey(date);
    return { date: key, label: dateLabel(date), count: Number(completionByDay?.[key]) || 0 };
  });
}

function CompletionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return <div className="completion-tooltip"><strong>{point.label}</strong><span>{point.count} görev tamamlandı</span></div>;
}

export default function CompletionChart({ completionByDay }) {
  const [range, setRange] = useState(7);
  const series = useMemo(() => buildDailySeries(completionByDay, range), [completionByDay, range]);
  const total = series.reduce((sum, day) => sum + day.count, 0);
  const average = (total / range).toFixed(1).replace(".", ",");
  const maxCount = Math.max(1, ...series.map((day) => day.count));

  return (
    <section className="completion-panel" aria-label="Tamamlanma grafiği">
      <header className="completion-heading">
        <div><p className="eyebrow">İlerleme</p><h2>Tamamlanma geçmişi</h2></div>
        <label className="completion-range">
          <span>Grafik dönemi</span>
          <select aria-label="Grafik dönemi" value={range} onChange={(event) => setRange(Number(event.target.value))}>
            {RANGES.map((days) => <option value={days} key={days}>{days} gün</option>)}
          </select>
        </label>
      </header>
      <p className="completion-caption">Son {range} gün · gün bazında tamamlanan görevler</p>
      <div className="completion-content">
        <div className="completion-chart" role="img" aria-label="Günlük tamamlanma dairesel grafiği">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart data={series} startAngle={90} endAngle={-270} innerRadius="38%" outerRadius="96%" barSize={Math.max(4, Math.min(14, 220 / range))}>
              <Tooltip content={<CompletionTooltip />} />
              <RadialBar dataKey="count" minAngle={2} background={{ fill: "var(--border)" }} cornerRadius={8} max={maxCount}>
                {series.map((day, index) => <Cell key={day.date} fill={day.count ? `hsl(${171 - Math.min(day.count, 8) * 4} 76% ${43 + (index % 3) * 4}%)` : "var(--border)"} />)}
              </RadialBar>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="completion-center" aria-hidden="true"><strong>{total}</strong><span>tamamlanan</span></div>
        </div>
        <div className="completion-summary">
          <div><span>Toplam</span><strong>{total}</strong><small>son {range} gün</small></div>
          <div><span>Günlük ortalama</span><strong>{average}</strong><small>görev / gün</small></div>
          <p>Halka üzerindeki her bölüm bir günü gösterir. Ayrıntı için bölümün üzerine gel.</p>
        </div>
      </div>
      <ul className="sr-only" aria-label="Günlük tamamlanma değerleri">
        {series.map((day) => <li key={day.date}>{day.label}: {day.count} görev</li>)}
      </ul>
    </section>
  );
}
