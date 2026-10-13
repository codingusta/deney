"""Flask JSON API for the rule-based LangGraph task workflow."""

from flask import Flask, jsonify, request

from graph import analyze_task, describe_graph


app = Flask(__name__, static_folder=None)


@app.post("/api/analiz")
def analyze():
    payload = request.get_json(silent=True) or {}
    task_text = payload.get("task_text", payload.get("text", ""))
    if not isinstance(task_text, str) or not task_text.strip():
        return jsonify({"error": "Görev metni boş olamaz."}), 400
    try:
        return jsonify(analyze_task(task_text))
    except Exception as error:
        app.logger.exception("Görev analizi başarısız")
        return jsonify({"error": f"Görev analiz edilemedi: {error}"}), 500


@app.get("/api/graf")
def graph_description():
    return jsonify(describe_graph())


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=False)
