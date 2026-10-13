"""Kural tabanlı LangGraph görev analiz akışı."""

from __future__ import annotations

import re
import time
from typing import Any, Callable, TypedDict

from langgraph.graph import END, START, StateGraph


class TaskState(TypedDict, total=False):
    task_text: str
    cleaned_text: str
    category: str
    category_found: bool
    urgency: str
    subtasks: list[str]
    summary: str
    needs_clarification: bool
    suggestion: str
    trace: list[dict[str, Any]]


CATEGORY_KEYWORDS = {
    "iş": ("iş", "toplantı", "rapor", "müşteri", "sunum", "proje", "ofis"),
    "okul": ("okul", "ders", "ödev", "sınav", "öğretmen", "üniversite", "çalış"),
    "alışveriş": ("alışveriş", "al", "satın", "market", "mağaza", "sipariş", "ürün", "ekmek"),
    "sağlık": ("doktor", "ilaç", "randevu", "hastane", "sağlık", "egzersiz", "spor"),
    "ev": ("ev", "temizle", "çamaşır", "bulaşık", "yemek", "tamir", "oda"),
}

SUBTASK_SUGGESTIONS = {
    "iş": ["Gerekli bilgileri topla", "İlgili kişilerle iletişime geç", "Sonucu gözden geçir"],
    "okul": ["Kaynakları ve notları hazırla", "Çalışma planı oluştur", "Çalışmanı gözden geçir"],
    "alışveriş": ["Alışveriş listesini hazırla", "Ürün ve fiyatları kontrol et", "Alışverişi tamamla"],
    "sağlık": ["Gerekli bilgileri not et", "Uygun zaman belirle", "Sonraki adımı takip et"],
    "ev": ["Gerekli malzemeleri hazırla", "İşi küçük adımlara böl", "Tamamlandığını kontrol et"],
    "diğer": ["Gerekli bilgileri belirle", "İlk adımı tamamla"],
}


def _tracked(name: str, operation: Callable[[TaskState], dict[str, Any]]):
    def run(state: TaskState) -> dict[str, Any]:
        started = time.perf_counter()
        output = operation(state)
        record = {
            "node": name,
            "duration_ms": round((time.perf_counter() - started) * 1000, 3),
            "output": output,
        }
        return {**output, "trace": [*state.get("trace", []), record]}

    return run


def temizle(state: TaskState) -> dict[str, Any]:
    cleaned = " ".join(state.get("task_text", "").split())
    if cleaned:
        first = "İ" if cleaned[0] == "i" else cleaned[0].upper()
        cleaned = first + cleaned[1:]
    return {"cleaned_text": cleaned}


def _words(text: str) -> set[str]:
    normalized = text.casefold().replace("i\u0307", "i")
    return set(re.findall(r"[^\W_]+", normalized))


def kategorile(state: TaskState) -> dict[str, Any]:
    words = _words(state.get("cleaned_text", ""))
    category = next((name for name, keywords in CATEGORY_KEYWORDS.items() if _has_keyword(words, keywords)), None)
    return {"category": category or "diğer", "category_found": category is not None}


def aciliyet_bul(state: TaskState) -> dict[str, Any]:
    words = _words(state.get("cleaned_text", ""))
    high = {"acil", "hemen", "ivedi", "şimdi"}
    medium = {"bugün", "yarın"}
    urgency = "yüksek" if _has_keyword(words, high) else "orta" if _has_keyword(words, medium) else "düşük"
    return {"urgency": urgency}


def netlestir(state: TaskState) -> dict[str, Any]:
    needs_clarification = len(state.get("cleaned_text", "").strip()) < 3 or not state.get("category_found", False)
    suggestion = "Görevi daha net yaz." if needs_clarification else ""
    return {"needs_clarification": needs_clarification, "suggestion": suggestion}


def alt_gorev_oner(state: TaskState) -> dict[str, Any]:
    return {"subtasks": SUBTASK_SUGGESTIONS.get(state.get("category", "diğer"), SUBTASK_SUGGESTIONS["diğer"])}


def ozetle(state: TaskState) -> dict[str, Any]:
    return {
        "summary": f"{state.get('cleaned_text', '')} — {state.get('category', 'diğer')} kategorisinde, {state.get('urgency', 'düşük')} aciliyetinde bir görev."
    }


def _after_category(state: TaskState) -> str:
    if len(state.get("cleaned_text", "").strip()) < 3 or not state.get("category_found", False):
        return "netlestir"
    return "aciliyet_bul"


def _has_keyword(words: set[str], keywords: set[str] | tuple[str, ...]) -> bool:
    return any(word == keyword or word.startswith(keyword) for word in words for keyword in keywords)


def _after_clarification(state: TaskState) -> str:
    return END if state.get("needs_clarification", False) else "alt_gorev_oner"


builder = StateGraph(TaskState)
builder.add_node("temizle", _tracked("temizle", temizle))
builder.add_node("kategorile", _tracked("kategorile", kategorile))
builder.add_node("aciliyet_bul", _tracked("aciliyet_bul", aciliyet_bul))
builder.add_node("netlestir", _tracked("netlestir", netlestir))
builder.add_node("alt_gorev_oner", _tracked("alt_gorev_oner", alt_gorev_oner))
builder.add_node("ozetle", _tracked("ozetle", ozetle))
builder.add_edge(START, "temizle")
builder.add_edge("temizle", "kategorile")
builder.add_conditional_edges("kategorile", _after_category, ["netlestir", "aciliyet_bul"])
builder.add_edge("aciliyet_bul", "netlestir")
builder.add_conditional_edges("netlestir", _after_clarification, [END, "alt_gorev_oner"])
builder.add_edge("alt_gorev_oner", "ozetle")
builder.add_edge("ozetle", END)
task_graph = builder.compile()


def analyze_task(task_text: str) -> TaskState:
    state: TaskState = {
        "task_text": task_text,
        "cleaned_text": "",
        "category": "diğer",
        "category_found": False,
        "urgency": "düşük",
        "subtasks": [],
        "summary": "",
        "needs_clarification": False,
        "suggestion": "",
        "trace": [],
    }
    for update in task_graph.stream(state, stream_mode="updates"):
        for patch in update.values():
            state.update(patch)
    return state


def describe_graph() -> dict[str, list[dict[str, Any]]]:
    graph = task_graph.get_graph()
    nodes = [{"id": node.id, "name": node.name or node.id} for node in graph.nodes.values()]
    edges = [
        {
            "source": edge.source,
            "target": edge.target,
            "conditional": bool(getattr(edge, "conditional", False)),
        }
        for edge in graph.edges
    ]
    return {"nodes": nodes, "edges": edges}
