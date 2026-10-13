"use client";

import { Background, Controls, Handle, Position, ReactFlow } from "@xyflow/react";

const positions = {
  __start__: [20, 132],
  temizle: [190, 132],
  kategorile: [390, 132],
  aciliyet_bul: [600, 30],
  netlestir: [600, 230],
  alt_gorev_oner: [820, 230],
  ozetle: [1030, 230],
  __end__: [1230, 132],
};

function TraceNode({ data }) {
  return (
    <div className={`graph-node${data.active ? " is-active" : ""}`} aria-label={`${data.title} ${data.active ? "tamamlandı" : "bekliyor"}`}>
      {data.title !== "__start__" && <Handle type="target" position={Position.Left} />}
      <strong>{data.title}</strong>
      {data.duration !== null && <span className="graph-duration">{data.duration} ms</span>}
      {data.output && <p>{data.output}</p>}
      {data.title !== "__end__" && <Handle type="source" position={Position.Right} />}
    </div>
  );
}

const nodeTypes = { trace: TraceNode };

function nodeOutput(entry) {
  if (!entry) return "";
  const values = Object.entries(entry.output ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`);
  return values.join(" · ");
}

function makeNodes(graph, trace) {
  const traceById = new Map(trace.map((item) => [item.node, item]));
  return (graph?.nodes ?? []).map((node) => {
    const entry = traceById.get(node.id);
    return {
      id: node.id,
      type: "trace",
      position: { x: positions[node.id]?.[0] ?? 40, y: positions[node.id]?.[1] ?? 40 },
      data: { title: node.name || node.id, active: Boolean(entry), duration: entry?.duration_ms ?? null, output: nodeOutput(entry) },
    };
  });
}

function makeEdges(graph, trace) {
  const visited = new Set(trace.map((item) => item.node));
  const transitions = new Set(trace.slice(1).map((item, index) => `${trace[index].node}->${item.node}`));
  return (graph?.edges ?? []).map((edge, index) => {
    const key = `${edge.source}->${edge.target}`;
    const visitedPath = transitions.has(key) || (edge.source === "__start__" && trace[0]?.node === edge.target) || (edge.target === "__end__" && trace.at(-1)?.node === edge.source);
    return {
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.conditional ? "koşullu" : undefined,
      animated: visitedPath,
      style: { stroke: visitedPath && visited.has(edge.source) ? "var(--accent)" : "var(--muted)", strokeWidth: visitedPath ? 2 : 1.25 },
      labelStyle: { fill: "var(--muted)", fontSize: 10 },
    };
  });
}

function countCategories(todos) {
  const counts = new Map();
  todos.filter((todo) => todo.analysis && todo.analysisAttempted).forEach((todo) => {
    const category = todo.analysis.category || "diğer";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "tr"));
}

export default function GraphPanel({ graph, graphError, trace, latestError, todos }) {
  const nodes = makeNodes(graph, trace ?? []);
  const edges = makeEdges(graph, trace ?? []);
  const categories = countCategories(todos);
  const total = todos.filter((todo) => todo.analysisAttempted).length;

  return (
    <section className="graph-panel" aria-label="LangGraph Paneli">
      <header className="graph-heading">
        <div><p className="eyebrow">İş akışı</p><h2>LangGraph Paneli</h2></div>
        <div className="graph-stats"><div><span>Toplam analiz</span><strong>{total}</strong></div><div><span>Kategori dağılımı</span><strong>{categories.length ? categories.map(([category, count]) => `${category} ${count}`).join(" · ") : "Henüz analiz yok"}</strong></div></div>
      </header>
      {graphError ? <p className="error" role="status">Graf yüklenemedi: {graphError}</p> : (
        <>
          <p className="graph-caption">Akış düğümleri · Son analizin geçtiği adımlar ve çıktıları vurgulanır.</p>
          <div className="graph-canvas" role="img" aria-label="LangGraph düğüm ve bağlantı haritası">
            {graph && <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.15 }} minZoom={0.25} maxZoom={1.5} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} proOptions={{ hideAttribution: true }}>
              <Background color="var(--border)" gap={22} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>}
          </div>
          {latestError && <p className="error graph-error" role="status">Son görev analiz edilemedi: {latestError}</p>}
          {trace?.length > 0 && <ol className="trace-list" aria-label="Son analiz iz kaydı">{trace.map((entry, index) => <li key={`${entry.node}-${index}`}><strong>{entry.node}</strong><span>{entry.duration_ms} ms</span><p>{nodeOutput(entry)}</p></li>)}</ol>}
        </>
      )}
    </section>
  );
}
