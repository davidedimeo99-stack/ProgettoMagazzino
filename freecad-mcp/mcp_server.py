#!/usr/bin/env python3
"""
FreeCAD MCP Server
Gira sul tuo PC Windows, fa da bridge tra Claude Code e FreeCAD.
Avvialo con: python mcp_server.py
"""

import asyncio
import json
import socket
import sys
from typing import Any

try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp import types
except ImportError:
    print("Installa il pacchetto mcp: pip install mcp", file=sys.stderr)
    sys.exit(1)

FREECAD_HOST = "127.0.0.1"
FREECAD_PORT = 9876


def send_to_freecad(action: str, params: dict = None) -> dict:
    """Invia un comando al socket server di FreeCAD e restituisce la risposta."""
    cmd = {"action": action, "params": params or {}}
    payload = (json.dumps(cmd) + "\n").encode("utf-8")

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(10)
        try:
            s.connect((FREECAD_HOST, FREECAD_PORT))
        except ConnectionRefusedError:
            return {
                "ok": False,
                "error": (
                    "Impossibile connettersi a FreeCAD. "
                    "Assicurati di aver incollato e avviato freecad_socket_server.py "
                    "nella console Python di FreeCAD."
                ),
            }
        s.sendall(payload)
        data = b""
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            data += chunk
            if data.endswith(b"\n"):
                break
    return json.loads(data.decode("utf-8"))


def _result_text(r: dict) -> str:
    if r.get("ok"):
        r.pop("ok")
        if not r:
            return "OK"
        return json.dumps(r, ensure_ascii=False, indent=2)
    else:
        return f"ERRORE: {r.get('error', 'Errore sconosciuto')}"


app = Server("freecad-mcp")


@app.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="freecad_ping",
            description="Verifica che FreeCAD sia connesso e il server sia attivo.",
            inputSchema={"type": "object", "properties": {}, "required": []},
        ),
        types.Tool(
            name="freecad_new_document",
            description="Crea un nuovo documento FreeCAD.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Nome del documento", "default": "MCPDoc"}
                },
                "required": [],
            },
        ),
        types.Tool(
            name="freecad_list_objects",
            description="Elenca tutti gli oggetti nel documento FreeCAD attivo.",
            inputSchema={"type": "object", "properties": {}, "required": []},
        ),
        types.Tool(
            name="freecad_create_box",
            description="Crea un parallelepipedo (box) in FreeCAD.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name":   {"type": "string",  "description": "Nome oggetto"},
                    "length": {"type": "number",  "description": "Lunghezza in mm", "default": 10},
                    "width":  {"type": "number",  "description": "Larghezza in mm", "default": 10},
                    "height": {"type": "number",  "description": "Altezza in mm",   "default": 10},
                    "x":      {"type": "number",  "description": "Posizione X",     "default": 0},
                    "y":      {"type": "number",  "description": "Posizione Y",     "default": 0},
                    "z":      {"type": "number",  "description": "Posizione Z",     "default": 0},
                },
                "required": [],
            },
        ),
        types.Tool(
            name="freecad_create_cylinder",
            description="Crea un cilindro in FreeCAD.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name":   {"type": "string", "description": "Nome oggetto"},
                    "radius": {"type": "number", "description": "Raggio in mm",  "default": 5},
                    "height": {"type": "number", "description": "Altezza in mm", "default": 10},
                    "x":      {"type": "number", "description": "Posizione X",   "default": 0},
                    "y":      {"type": "number", "description": "Posizione Y",   "default": 0},
                    "z":      {"type": "number", "description": "Posizione Z",   "default": 0},
                },
                "required": [],
            },
        ),
        types.Tool(
            name="freecad_create_sphere",
            description="Crea una sfera in FreeCAD.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name":   {"type": "string", "description": "Nome oggetto"},
                    "radius": {"type": "number", "description": "Raggio in mm", "default": 5},
                    "x":      {"type": "number", "description": "Posizione X",  "default": 0},
                    "y":      {"type": "number", "description": "Posizione Y",  "default": 0},
                    "z":      {"type": "number", "description": "Posizione Z",  "default": 0},
                },
                "required": [],
            },
        ),
        types.Tool(
            name="freecad_create_cone",
            description="Crea un cono in FreeCAD.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name":    {"type": "string", "description": "Nome oggetto"},
                    "radius1": {"type": "number", "description": "Raggio base in mm",  "default": 5},
                    "radius2": {"type": "number", "description": "Raggio apice in mm", "default": 0},
                    "height":  {"type": "number", "description": "Altezza in mm",      "default": 10},
                },
                "required": [],
            },
        ),
        types.Tool(
            name="freecad_create_torus",
            description="Crea un toro (ciambella) in FreeCAD.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name":    {"type": "string", "description": "Nome oggetto"},
                    "radius1": {"type": "number", "description": "Raggio esterno in mm", "default": 10},
                    "radius2": {"type": "number", "description": "Raggio del tubo in mm", "default": 2},
                },
                "required": [],
            },
        ),
        types.Tool(
            name="freecad_boolean_union",
            description="Unisce due oggetti (booleana unione/fuse).",
            inputSchema={
                "type": "object",
                "properties": {
                    "obj1": {"type": "string", "description": "Nome primo oggetto"},
                    "obj2": {"type": "string", "description": "Nome secondo oggetto"},
                    "name": {"type": "string", "description": "Nome risultato"},
                },
                "required": ["obj1", "obj2"],
            },
        ),
        types.Tool(
            name="freecad_boolean_cut",
            description="Sottrae obj2 da obj1 (booleana differenza/cut).",
            inputSchema={
                "type": "object",
                "properties": {
                    "obj1": {"type": "string", "description": "Oggetto base"},
                    "obj2": {"type": "string", "description": "Oggetto da sottrarre"},
                    "name": {"type": "string", "description": "Nome risultato"},
                },
                "required": ["obj1", "obj2"],
            },
        ),
        types.Tool(
            name="freecad_boolean_intersection",
            description="Intersezione di due oggetti (booleana common).",
            inputSchema={
                "type": "object",
                "properties": {
                    "obj1": {"type": "string", "description": "Nome primo oggetto"},
                    "obj2": {"type": "string", "description": "Nome secondo oggetto"},
                    "name": {"type": "string", "description": "Nome risultato"},
                },
                "required": ["obj1", "obj2"],
            },
        ),
        types.Tool(
            name="freecad_move_object",
            description="Sposta un oggetto in una posizione XYZ.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Nome oggetto"},
                    "x":    {"type": "number", "description": "Nuova posizione X"},
                    "y":    {"type": "number", "description": "Nuova posizione Y"},
                    "z":    {"type": "number", "description": "Nuova posizione Z"},
                },
                "required": ["name"],
            },
        ),
        types.Tool(
            name="freecad_rotate_object",
            description="Ruota un oggetto attorno a un asse di un angolo specificato.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name":  {"type": "string", "description": "Nome oggetto"},
                    "ax":    {"type": "number", "description": "Componente X asse (default 0)"},
                    "ay":    {"type": "number", "description": "Componente Y asse (default 0)"},
                    "az":    {"type": "number", "description": "Componente Z asse (default 1)"},
                    "angle": {"type": "number", "description": "Angolo in gradi"},
                },
                "required": ["name", "angle"],
            },
        ),
        types.Tool(
            name="freecad_delete_object",
            description="Elimina un oggetto dal documento FreeCAD.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Nome oggetto da eliminare"},
                },
                "required": ["name"],
            },
        ),
        types.Tool(
            name="freecad_save_document",
            description="Salva il documento FreeCAD corrente.",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Percorso file .FCStd (opzionale se gia' salvato)"},
                },
                "required": [],
            },
        ),
        types.Tool(
            name="freecad_export_stl",
            description="Esporta gli oggetti del documento in formato STL.",
            inputSchema={
                "type": "object",
                "properties": {
                    "path":    {"type": "string", "description": "Percorso file .stl"},
                    "objects": {"type": "array",  "items": {"type": "string"}, "description": "Lista nomi oggetti (tutti se omesso)"},
                },
                "required": ["path"],
            },
        ),
        types.Tool(
            name="freecad_run_python",
            description="Esegue codice Python arbitrario nella console FreeCAD. Metti il risultato in _result.",
            inputSchema={
                "type": "object",
                "properties": {
                    "code": {"type": "string", "description": "Codice Python da eseguire in FreeCAD"},
                },
                "required": ["code"],
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[types.TextContent]:
    action_map = {
        "freecad_ping":                 "ping",
        "freecad_new_document":         "new_document",
        "freecad_list_objects":         "list_objects",
        "freecad_create_box":           "create_box",
        "freecad_create_cylinder":      "create_cylinder",
        "freecad_create_sphere":        "create_sphere",
        "freecad_create_cone":          "create_cone",
        "freecad_create_torus":         "create_torus",
        "freecad_boolean_union":        "boolean_union",
        "freecad_boolean_cut":          "boolean_cut",
        "freecad_boolean_intersection": "boolean_intersection",
        "freecad_move_object":          "move_object",
        "freecad_rotate_object":        "rotate_object",
        "freecad_delete_object":        "delete_object",
        "freecad_save_document":        "save_document",
        "freecad_export_stl":           "export_stl",
        "freecad_run_python":           "run_python",
    }
    action = action_map.get(name)
    if action is None:
        return [types.TextContent(type="text", text=f"Tool sconosciuto: {name}")]

    result = await asyncio.get_event_loop().run_in_executor(
        None, send_to_freecad, action, arguments
    )
    return [types.TextContent(type="text", text=_result_text(result))]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
