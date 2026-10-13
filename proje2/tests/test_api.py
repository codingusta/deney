from server import app


def test_flask_serves_api_without_static_ui():
    response = app.test_client().get("/")

    assert response.status_code == 404


def test_analysis_endpoint_keeps_rule_based_graph_contract():
    response = app.test_client().post("/api/analiz", json={"task_text": "Acil toplantı hazırla"})

    assert response.status_code == 200
    result = response.get_json()
    assert result["cleaned_text"] == "Acil toplantı hazırla"
    assert result["category"] == "iş"
    assert result["urgency"] == "yüksek"
    assert result["trace"]


def test_graph_endpoint_returns_nodes_and_edges():
    result = app.test_client().get("/api/graf").get_json()

    assert "nodes" in result
    assert "edges" in result
    assert {node["id"] for node in result["nodes"]} >= {"temizle", "kategorile", "ozetle"}


def test_analysis_rejects_blank_task_text():
    response = app.test_client().post("/api/analiz", json={"task_text": "   "})

    assert response.status_code == 400
    assert "error" in response.get_json()
