# FreeCAD MCP Socket Server
# Incolla questo script nella console Python di FreeCAD (View > Panels > Python Console)
# e premi Invio. Il server rimane attivo finche' FreeCAD e' aperto.

import socket
import threading
import json
import traceback

try:
    import FreeCAD
    import FreeCADGui
    import Part
    FREECAD_AVAILABLE = True
except ImportError:
    FREECAD_AVAILABLE = False
    print("ERRORE: FreeCAD non trovato. Esegui questo script dentro FreeCAD.")

HOST = "127.0.0.1"
PORT = 9876
_server_thread = None
_server_stop = threading.Event()


def _get_or_create_doc(name="MCPDoc"):
    doc = FreeCAD.activeDocument()
    if doc is None:
        doc = FreeCAD.newDocument(name)
    return doc


def _handle(cmd):
    action = cmd.get("action", "")
    p = cmd.get("params", {})

    if action == "ping":
        return {"ok": True, "message": "FreeCAD MCP Server attivo"}

    elif action == "new_document":
        doc = FreeCAD.newDocument(p.get("name", "MCPDoc"))
        return {"ok": True, "name": doc.Name}

    elif action == "list_objects":
        doc = FreeCAD.activeDocument()
        if doc is None:
            return {"ok": True, "objects": []}
        objs = [{"name": o.Name, "type": o.TypeId} for o in doc.Objects]
        return {"ok": True, "objects": objs}

    elif action == "create_box":
        doc = _get_or_create_doc()
        obj = doc.addObject("Part::Box", p.get("name", "Box"))
        obj.Length = float(p.get("length", 10))
        obj.Width  = float(p.get("width",  10))
        obj.Height = float(p.get("height", 10))
        if "x" in p or "y" in p or "z" in p:
            obj.Placement.Base = FreeCAD.Vector(
                float(p.get("x", 0)),
                float(p.get("y", 0)),
                float(p.get("z", 0)),
            )
        doc.recompute()
        FreeCADGui.updateGui()
        return {"ok": True, "name": obj.Name}

    elif action == "create_cylinder":
        doc = _get_or_create_doc()
        obj = doc.addObject("Part::Cylinder", p.get("name", "Cylinder"))
        obj.Radius = float(p.get("radius", 5))
        obj.Height = float(p.get("height", 10))
        if "x" in p or "y" in p or "z" in p:
            obj.Placement.Base = FreeCAD.Vector(
                float(p.get("x", 0)),
                float(p.get("y", 0)),
                float(p.get("z", 0)),
            )
        doc.recompute()
        FreeCADGui.updateGui()
        return {"ok": True, "name": obj.Name}

    elif action == "create_sphere":
        doc = _get_or_create_doc()
        obj = doc.addObject("Part::Sphere", p.get("name", "Sphere"))
        obj.Radius = float(p.get("radius", 5))
        if "x" in p or "y" in p or "z" in p:
            obj.Placement.Base = FreeCAD.Vector(
                float(p.get("x", 0)),
                float(p.get("y", 0)),
                float(p.get("z", 0)),
            )
        doc.recompute()
        FreeCADGui.updateGui()
        return {"ok": True, "name": obj.Name}

    elif action == "create_cone":
        doc = _get_or_create_doc()
        obj = doc.addObject("Part::Cone", p.get("name", "Cone"))
        obj.Radius1 = float(p.get("radius1", 5))
        obj.Radius2 = float(p.get("radius2", 0))
        obj.Height  = float(p.get("height", 10))
        doc.recompute()
        FreeCADGui.updateGui()
        return {"ok": True, "name": obj.Name}

    elif action == "create_torus":
        doc = _get_or_create_doc()
        obj = doc.addObject("Part::Torus", p.get("name", "Torus"))
        obj.Radius1 = float(p.get("radius1", 10))
        obj.Radius2 = float(p.get("radius2", 2))
        doc.recompute()
        FreeCADGui.updateGui()
        return {"ok": True, "name": obj.Name}

    elif action == "boolean_union":
        doc = _get_or_create_doc()
        o1 = doc.getObject(p["obj1"])
        o2 = doc.getObject(p["obj2"])
        if o1 is None or o2 is None:
            return {"ok": False, "error": "Oggetto non trovato"}
        fusion = doc.addObject("Part::Fuse", p.get("name", "Union"))
        fusion.Base = o1
        fusion.Tool = o2
        doc.recompute()
        FreeCADGui.updateGui()
        return {"ok": True, "name": fusion.Name}

    elif action == "boolean_cut":
        doc = _get_or_create_doc()
        o1 = doc.getObject(p["obj1"])
        o2 = doc.getObject(p["obj2"])
        if o1 is None or o2 is None:
            return {"ok": False, "error": "Oggetto non trovato"}
        cut = doc.addObject("Part::Cut", p.get("name", "Cut"))
        cut.Base = o1
        cut.Tool = o2
        doc.recompute()
        FreeCADGui.updateGui()
        return {"ok": True, "name": cut.Name}

    elif action == "boolean_intersection":
        doc = _get_or_create_doc()
        o1 = doc.getObject(p["obj1"])
        o2 = doc.getObject(p["obj2"])
        if o1 is None or o2 is None:
            return {"ok": False, "error": "Oggetto non trovato"}
        common = doc.addObject("Part::Common", p.get("name", "Intersection"))
        common.Base = o1
        common.Tool = o2
        doc.recompute()
        FreeCADGui.updateGui()
        return {"ok": True, "name": common.Name}

    elif action == "move_object":
        doc = _get_or_create_doc()
        obj = doc.getObject(p["name"])
        if obj is None:
            return {"ok": False, "error": f"Oggetto '{p['name']}' non trovato"}
        obj.Placement.Base = FreeCAD.Vector(
            float(p.get("x", 0)),
            float(p.get("y", 0)),
            float(p.get("z", 0)),
        )
        doc.recompute()
        FreeCADGui.updateGui()
        return {"ok": True}

    elif action == "rotate_object":
        doc = _get_or_create_doc()
        obj = doc.getObject(p["name"])
        if obj is None:
            return {"ok": False, "error": f"Oggetto '{p['name']}' non trovato"}
        axis = FreeCAD.Vector(
            float(p.get("ax", 0)),
            float(p.get("ay", 0)),
            float(p.get("az", 1)),
        )
        obj.Placement.Rotation = FreeCAD.Rotation(axis, float(p.get("angle", 0)))
        doc.recompute()
        FreeCADGui.updateGui()
        return {"ok": True}

    elif action == "delete_object":
        doc = FreeCAD.activeDocument()
        if doc is None:
            return {"ok": False, "error": "Nessun documento aperto"}
        doc.removeObject(p["name"])
        doc.recompute()
        FreeCADGui.updateGui()
        return {"ok": True}

    elif action == "save_document":
        doc = FreeCAD.activeDocument()
        if doc is None:
            return {"ok": False, "error": "Nessun documento aperto"}
        path = p.get("path")
        if path:
            doc.saveAs(path)
        else:
            if not doc.FileName:
                return {"ok": False, "error": "Percorso file non specificato e documento non ha un file associato"}
            doc.save()
        return {"ok": True, "path": doc.FileName}

    elif action == "export_stl":
        doc = FreeCAD.activeDocument()
        if doc is None:
            return {"ok": False, "error": "Nessun documento aperto"}
        import Mesh
        path = p.get("path", "C:/Users/Public/Documents/export.stl")
        objects = doc.Objects if not p.get("objects") else [doc.getObject(n) for n in p["objects"]]
        Mesh.export(objects, path)
        return {"ok": True, "path": path}

    elif action == "run_python":
        # Esegue codice Python arbitrario in FreeCAD (usa con cautela)
        code = p.get("code", "")
        local_vars = {"FreeCAD": FreeCAD, "FreeCADGui": FreeCADGui, "Part": Part}
        exec(code, local_vars)
        result = local_vars.get("_result", None)
        return {"ok": True, "result": str(result) if result is not None else None}

    else:
        return {"ok": False, "error": f"Azione sconosciuta: '{action}'"}


def _client_handler(conn):
    try:
        data = b""
        while True:
            chunk = conn.recv(4096)
            if not chunk:
                break
            data += chunk
            if data.endswith(b"\n"):
                break
        if data:
            cmd = json.loads(data.decode("utf-8"))
            try:
                result = _handle(cmd)
            except Exception:
                result = {"ok": False, "error": traceback.format_exc()}
            conn.sendall((json.dumps(result) + "\n").encode("utf-8"))
    except Exception as e:
        print(f"[MCP] Errore client: {e}")
    finally:
        conn.close()


def _server_loop():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind((HOST, PORT))
    srv.listen(10)
    srv.settimeout(1.0)
    print(f"[MCP] FreeCAD socket server in ascolto su {HOST}:{PORT}")
    while not _server_stop.is_set():
        try:
            conn, _ = srv.accept()
            t = threading.Thread(target=_client_handler, args=(conn,), daemon=True)
            t.start()
        except socket.timeout:
            continue
        except Exception as e:
            if not _server_stop.is_set():
                print(f"[MCP] Errore server: {e}")
    srv.close()
    print("[MCP] Server fermato.")


def start_server():
    global _server_thread
    _server_stop.clear()
    _server_thread = threading.Thread(target=_server_loop, daemon=True)
    _server_thread.start()
    print("[MCP] Server avviato! Ora puoi usare Claude Code con FreeCAD.")


def stop_server():
    _server_stop.set()
    print("[MCP] Arresto server in corso...")


# Avvio automatico
start_server()
