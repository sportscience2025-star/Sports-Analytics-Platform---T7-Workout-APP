# -*- coding: utf-8 -*-
"""
Master Deployment Script: Rilascio dei 18 Flowchart Architetturali Multi-Software
e della Zona 0 direttamente sulla Board Miro Online del Progetto T7 Workout.
Board ID: uXjVEbo6L2o= ("FITNESS APP FLOWCHART")
"""

import urllib.request
import json
import time
import sys
import os

from miro_flowcharts_data import (
    ZONA_0_DATA,
    BATCH_1_CONSUMER,
    BATCH_2_PRO,
    BATCH_3_CLUB
)

BOARD_ID = "uXjVEbo6L2o="
TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_e8i4xJ8gI38ajk5VyKGgsy8dd2U"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

# Griglia Coordinate Spaziali
COL_GAP = 2200
ROW_GAP = 2600
BASE_X = 0
BASE_Y = 2600

# Palette Colori Standard
STYLE_MAP = {
    "teal": {"fill": "#ccfbf1", "border": "#0d9488", "text": "#0f172a"},
    "cyan": {"fill": "#e0f2fe", "border": "#0284c7", "text": "#0f172a"},
    "purple": {"fill": "#ede9fe", "border": "#7c3aed", "text": "#0f172a"},
    "green": {"fill": "#d1fae5", "border": "#059669", "text": "#0f172a"},
    "rose": {"fill": "#ffe4e6", "border": "#e11d48", "text": "#0f172a"},
    "amber": {"fill": "#fef3c7", "border": "#d97706", "text": "#0f172a"},
    "red": {"fill": "#fee2e2", "border": "#dc2626", "text": "#7f1d1d"},
    "gray": {"fill": "#f8fafc", "border": "#64748b", "text": "#0f172a"}
}

SHAPE_TYPE_MAP = {
    "rect": "rectangle",
    "pill": "round_rectangle",
    "diamond": "rhombus",
    "cylinder": "can"
}

def api_call(url, payload=None, method="POST", retries=3):
    """Esegue una chiamata autenticata alle API Miro con retry su rate limit."""
    data_bytes = json.dumps(payload).encode("utf-8") if payload else None
    req = urllib.request.Request(url, data=data_bytes, headers=HEADERS, method=method)
    for attempt in range(retries):
        try:
            res = urllib.request.urlopen(req)
            return json.loads(res.read())
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8") if hasattr(e, "read") else str(e)
            if e.code == 429:
                wait_time = 2.0 * (attempt + 1)
                print(f"[429 Rate Limit] Attendo {wait_time}s e riprovo...")
                time.sleep(wait_time)
                continue
            print(f"[HTTP Error {e.code}] URL: {url} | Body: {err_body}")
            raise
        except Exception as e:
            if attempt == retries - 1:
                raise
            time.sleep(1.0)
    return None

def create_frame(title, x, y, width, height):
    """Crea un frame su Miro per delimitare ciascun flowchart."""
    url = f"https://api.miro.com/v2/boards/{BOARD_ID}/frames"
    payload = {
        "data": {
            "title": title,
            "format": "custom",
            "type": "freeform"
        },
        "style": {
            "fillColor": "#ffffff"
        },
        "position": {
            "origin": "center",
            "x": x,
            "y": y
        },
        "geometry": {
            "width": width,
            "height": height
        }
    }
    res = api_call(url, payload)
    time.sleep(0.08)
    return res["id"]

def create_shape(content, shape_type, x, y, width, height, fill_color, border_color, border_width="2.0", text_color="#0f172a"):
    """Crea una forma geometrica con contenuto HTML formattato."""
    url = f"https://api.miro.com/v2/boards/{BOARD_ID}/shapes"
    payload = {
        "data": {
            "content": f"<p>{content}</p>",
            "shape": shape_type
        },
        "style": {
            "fillColor": fill_color,
            "borderColor": border_color,
            "borderWidth": border_width,
            "textAlign": "center",
            "color": text_color
        },
        "position": {
            "origin": "center",
            "x": x,
            "y": y
        },
        "geometry": {
            "width": width,
            "height": height
        }
    }
    res = api_call(url, payload)
    time.sleep(0.06)
    return res["id"]

def create_connector(start_id, end_id, caption="", stroke_color="#64748b"):
    """Crea un connettore smart direzionale tra due nodi."""
    url = f"https://api.miro.com/v2/boards/{BOARD_ID}/connectors"
    payload = {
        "startItem": {"id": start_id, "snapTo": "auto"},
        "endItem": {"id": end_id, "snapTo": "auto"},
        "style": {
            "strokeColor": stroke_color,
            "strokeWidth": "2.0",
            "strokeStyle": "normal"
        },
        "shape": "curved"
    }
    if caption:
        payload["captions"] = [{"content": caption, "position": "50%"}]
    
    res = api_call(url, payload)
    time.sleep(0.06)
    return res["id"]

def deploy_zona_0():
    """Rilascia la Zona 0 con il Glossario e la Matrice RBAC."""
    print("\n--- RILASCIO ZONA 0: LIVING GLOSSARY & RBAC MATRIX ---")
    data = ZONA_0_DATA
    frame_id = create_frame(data["title"], data["x"], data["y"], data["width"], data["height"])
    print(f"Zona 0 Frame creato (ID: {frame_id})")

    # Creazione delle sezioni interne
    section_y_start = data["y"] - 3200
    for idx, sec in enumerate(data["sections"]):
        sec_y = section_y_start + (idx * 1650)
        # Header Box
        create_shape(
            f"<strong>{sec['header']}</strong>",
            "rectangle",
            data["x"],
            sec_y - 650,
            1700,
            70,
            "#0f172a",
            "#38bdf8",
            "2.0",
            "#ffffff"
        )
        # Content Box
        create_shape(
            sec["content"],
            "round_rectangle",
            data["x"],
            sec_y,
            1700,
            1150,
            "#ffffff",
            "#cbd5e1",
            "1.0",
            "#0f172a"
        )
        print(f"  + Creata sezione: {sec['header']}")

def deploy_flowchart(flow):
    """Rilascia un singolo flowchart completo di frame, swimlanes, nodi e connettori."""
    col = flow["col"]
    row = flow["row"]
    x_base = BASE_X + (col * COL_GAP)
    y_base = BASE_Y + (row * ROW_GAP)

    print(f"\n--> Deploy Flow {flow['id']}: {flow['title']} a (X={x_base}, Y={y_base})")
    
    # 1. Crea Frame
    frame_id = create_frame(flow["title"], x_base, y_base, 1950, 2300)

    # 2. Crea Swimlanes di sfondo
    lanes_meta = [
        {"lane": 1, "y_off": -680, "h": 380, "name": "LANE 1: THIN CLIENT UI/UX", "fill": "#f0f9ff", "border": "#bae6fd"},
        {"lane": 2, "y_off": -250, "h": 280, "name": "LANE 2: API GATEWAY & RBAC", "fill": "#faf5ff", "border": "#e9d5ff"},
        {"lane": 3, "y_off": 180,  "h": 360, "name": "LANE 3: SERVER SCATOLA NERA (IP ALGORITHMS)", "fill": "#ecfdf5", "border": "#a7f3d0"},
        {"lane": 4, "y_off": 660,  "h": 320, "name": "LANE 4: MULTI-TENANT DATABASE", "fill": "#fff1f2", "border": "#fecdd3"}
    ]

    for lm in lanes_meta:
        ly = y_base + lm["y_off"]
        # Background Swimlane
        create_shape("", "rectangle", x_base, ly, 1860, lm["h"], lm["fill"], lm["border"], "1.0", "#0f172a")
        # Lane Tag Header
        create_shape(f"<small><strong>{lm['name']}</strong></small>", "round_rectangle", x_base - 720, ly - (lm["h"] // 2) + 25, 280, 36, "#ffffff", lm["border"], "1.0", "#475569")

    # 3. Crea Nodi
    node_id_map = {}
    for node in flow["nodes"]:
        lane_idx = node["lane"]
        # Posizione Y in base alla corsia
        y_center = y_base + lanes_meta[lane_idx - 1]["y_off"]
        x_node = x_base + node["x_off"]

        style = STYLE_MAP.get(node.get("style", "cyan"), STYLE_MAP["cyan"])
        shape_type = SHAPE_TYPE_MAP.get(node.get("type", "rect"), "rectangle")

        w, h = 210, 85
        if shape_type == "rhombus":
            w, h = 190, 95
        elif shape_type == "round_rectangle":
            w, h = 220, 75
        elif shape_type == "can":
            w, h = 190, 90

        miro_node_id = create_shape(
            node["text"],
            shape_type,
            x_node,
            y_center,
            w,
            h,
            style["fill"],
            style["border"],
            "2.0",
            style["text"]
        )
        node_id_map[node["id"]] = miro_node_id

    # 4. Crea Connettori Smart
    for conn in flow.get("connectors", []):
        start_key, end_key = conn[0], conn[1]
        caption = conn[2] if len(conn) > 2 else ""
        if start_key in node_id_map and end_key in node_id_map:
            create_connector(node_id_map[start_key], node_id_map[end_key], caption)

    print(f"  OK Flow {flow['id']} completato ({len(flow['nodes'])} nodi, {len(flow.get('connectors', []))} connettori)")

def run():
    mode = sys.argv[1] if len(sys.argv) > 1 else "--batch1"
    
    if mode in ["--batch0", "--zona0", "--all"]:
        deploy_zona_0()

    if mode in ["--batch1", "--consumer", "--all"]:
        print("\n=======================================================")
        print("  AVVIO BATCH 1: SOFTWARE 1 (CONSUMER EDITION B2C)")
        print("=======================================================")
        for f in BATCH_1_CONSUMER:
            deploy_flowchart(f)
            time.sleep(0.5)

    if mode in ["--batch2", "--pro", "--all"]:
        print("\n=======================================================")
        print("  AVVIO BATCH 2: SOFTWARE 2 (PRO / SPECIALIST B2B P.IVA)")
        print("=======================================================")
        for f in BATCH_2_PRO:
            deploy_flowchart(f)
            time.sleep(0.5)

    if mode in ["--batch3", "--club", "--all"]:
        print("\n=======================================================")
        print("  AVVIO BATCH 3: SOFTWARE 3 (ELITE CLUB B2B ENTERPRISE)")
        print("=======================================================")
        for f in BATCH_3_CLUB:
            deploy_flowchart(f)
            time.sleep(0.5)

    print("\nEsecuzione completata con successo sulla Board Miro online.")

if __name__ == "__main__":
    run()
