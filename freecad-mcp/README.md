# FreeCAD MCP — Integrazione Claude Code ↔ FreeCAD

Questa cartella contiene tutto il necessario per far comunicare Claude con FreeCAD 1.1.1 in tempo reale.

---

## Come funziona

```
Claude Code ──→ mcp_server.py ──→ socket TCP 127.0.0.1:9876 ──→ FreeCAD
```

---

## Setup (una tantum)

### 1. Installa il pacchetto MCP per Python

Apri un terminale **Windows** (non la console di FreeCAD) e digita:

```
pip install mcp
```

> Se non hai Python sul PATH di Windows, usa: `py -3 -m pip install mcp`

---

### 2. Avvia il server socket dentro FreeCAD

1. Apri FreeCAD
2. Vai su **View → Panels → Python Console**
3. Clicca nel campo di testo della console
4. Apri il file `freecad_socket_server.py` con un editor di testo, **seleziona tutto** (Ctrl+A), **copia** (Ctrl+C)
5. Incolla nella console Python di FreeCAD e premi **Invio**

Dovresti vedere:
```
[MCP] FreeCAD socket server in ascolto su 127.0.0.1:9876
[MCP] Server avviato! Ora puoi usare Claude Code con FreeCAD.
```

> Il server rimane attivo finché FreeCAD è aperto. Ogni volta che riapri FreeCAD devi ripetere questo passaggio (oppure aggiungi il file come macro automatica).

---

### 3. Configura Claude Code per usare il server MCP

Crea o modifica il file `%APPDATA%\Claude\claude_desktop_config.json` (per Claude Desktop) oppure `~/.claude/settings.json` (per Claude Code CLI):

**`~/.claude/settings.json`** — aggiungi nella sezione `mcpServers`:

```json
{
  "mcpServers": {
    "freecad": {
      "command": "python",
      "args": ["C:\\percorso\\completo\\freecad-mcp\\mcp_server.py"]
    }
  }
}
```

> Sostituisci `C:\\percorso\\completo\\` con il percorso reale dove hai salvato questa cartella.
> Se `python` non funziona, prova con `py` o il percorso completo a Python (es. `C:\\Python311\\python.exe`).

---

### 4. Riavvia Claude Code

Dopo aver modificato `settings.json`, riavvia Claude Code CLI. Il server MCP verrà avviato automaticamente.

---

## Verifica che funzioni

In Claude Code digita:
> "Usa freecad_ping per verificare la connessione"

Se tutto è ok risponderà: `FreeCAD MCP Server attivo`

---

## Comandi disponibili

| Tool Claude | Cosa fa |
|---|---|
| `freecad_ping` | Verifica connessione |
| `freecad_new_document` | Crea nuovo documento |
| `freecad_list_objects` | Elenca oggetti nel documento |
| `freecad_create_box` | Crea parallelepipedo |
| `freecad_create_cylinder` | Crea cilindro |
| `freecad_create_sphere` | Crea sfera |
| `freecad_create_cone` | Crea cono |
| `freecad_create_torus` | Crea toro |
| `freecad_boolean_union` | Unione booleana |
| `freecad_boolean_cut` | Differenza booleana |
| `freecad_boolean_intersection` | Intersezione booleana |
| `freecad_move_object` | Sposta oggetto |
| `freecad_rotate_object` | Ruota oggetto |
| `freecad_delete_object` | Elimina oggetto |
| `freecad_save_document` | Salva documento `.FCStd` |
| `freecad_export_stl` | Esporta in STL |
| `freecad_run_python` | Esegue Python arbitrario in FreeCAD |

---

## Fermare il server (dentro FreeCAD)

Nella console Python di FreeCAD digita:
```python
stop_server()
```
