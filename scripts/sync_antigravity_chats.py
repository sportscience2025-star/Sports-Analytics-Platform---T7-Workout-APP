#!/usr/bin/env python3
"""
Sincronizzatore bidirezionale conversazioni tra Antigravity 2.0 e Antigravity IDE.

Scopo:
- Allinea i database SQLite delle conversazioni (*.db) tra:
    C:\\Users\\<user>\\.gemini\\antigravity\\conversations\\ (Antigravity 2.0)
    C:\\Users\\<user>\\.gemini\\antigravity-ide\\conversations\\ (Antigravity IDE)
- Allinea le cartelle brain (transcript, artifacts, logs).
- Sincronizza i file di sommario (conversation_summaries.db, agyhub_summaries_proto.pb).
- Aggiorna la chiave 'antigravityUnifiedStateSync.trajectorySummaries' in state.vscdb
  per permettere ad Antigravity IDE di visualizzare tutte le conversazioni pregresse.
"""

import os
import shutil
import sqlite3
import base64
import sys
from pathlib import Path

# Percorsi costanti delle directory runtime di Antigravity
USER_PROFILE = os.path.expanduser("~")
GEMINI_DIR = Path(USER_PROFILE) / ".gemini"
APP_2_DIR = GEMINI_DIR / "antigravity"
APP_IDE_DIR = GEMINI_DIR / "antigravity-ide"
VSCDB_PATH = Path(USER_PROFILE) / "AppData" / "Roaming" / "Antigravity IDE" / "User" / "globalStorage" / "state.vscdb"

TRAJECTORY_KEY = "antigravityUnifiedStateSync.trajectorySummaries"
BUSY_TIMEOUT_MS = 5000


def copy_sqlite_safe(src_path: Path, dst_path: Path) -> bool:
    """
    Copia in modo sicuro un database SQLite anche se attualmente aperto da un altro processo.
    Utilizza la SQLite Online Backup API con timeout di attesa.
    """
    try:
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        src_conn = sqlite3.connect(str(src_path), timeout=BUSY_TIMEOUT_MS / 1000.0)
        dst_conn = sqlite3.connect(str(dst_path), timeout=BUSY_TIMEOUT_MS / 1000.0)
        with dst_conn:
            src_conn.backup(dst_conn)
        src_conn.close()
        dst_conn.close()
        return True
    except Exception:
        # Fallback alla copia standard con metadata
        try:
            shutil.copy2(str(src_path), str(dst_path))
            return True
        except Exception as err:
            print(f"[WARN] Impossibile copiare {src_path.name}: {err}", file=sys.stderr)
            return False


def sync_conversations() -> int:
    """
    Sincronizza bidirezionalmente i file *.db delle conversazioni.
    Restituisce il numero totale di conversazioni sincronizzate.
    """
    conv_2 = APP_2_DIR / "conversations"
    conv_ide = APP_IDE_DIR / "conversations"

    conv_2.mkdir(parents=True, exist_ok=True)
    conv_ide.mkdir(parents=True, exist_ok=True)

    copied = 0

    # Da Antigravity 2.0 verso IDE
    for db_file in conv_2.glob("*.db"):
        target = conv_ide / db_file.name
        if not target.exists() or db_file.stat().st_mtime > target.stat().st_mtime:
            if copy_sqlite_safe(db_file, target):
                copied += 1

    # Da IDE verso Antigravity 2.0
    for db_file in conv_ide.glob("*.db"):
        target = conv_2 / db_file.name
        if not target.exists() or db_file.stat().st_mtime > target.stat().st_mtime:
            if copy_sqlite_safe(db_file, target):
                copied += 1

    return copied


def sync_brain_folders() -> int:
    """
    Sincronizza le cartelle brain (transcript, artifacts, logs).
    Restituisce il numero di cartelle brain sincronizzate.
    """
    brain_2 = APP_2_DIR / "brain"
    brain_ide = APP_IDE_DIR / "brain"

    brain_2.mkdir(parents=True, exist_ok=True)
    brain_ide.mkdir(parents=True, exist_ok=True)

    synced_folders = 0

    # Da Antigravity 2.0 verso IDE
    for sub in brain_2.iterdir():
        if sub.is_dir():
            target = brain_ide / sub.name
            if not target.exists():
                shutil.copytree(str(sub), str(target), dirs_exist_ok=True)
                synced_folders += 1

    # Da IDE verso Antigravity 2.0
    for sub in brain_ide.iterdir():
        if sub.is_dir():
            target = brain_2 / sub.name
            if not target.exists():
                shutil.copytree(str(sub), str(target), dirs_exist_ok=True)
                synced_folders += 1

    return synced_folders


def sync_summaries_and_index() -> bool:
    """
    Sincronizza i file di sommario e aggiorna l'indice nello state.vscdb di Antigravity IDE.
    """
    proto_src = APP_2_DIR / "agyhub_summaries_proto.pb"
    proto_dst = APP_IDE_DIR / "agyhub_summaries_proto.pb"
    db_sum_src = APP_2_DIR / "conversation_summaries.db"
    db_sum_dst = APP_IDE_DIR / "conversation_summaries.db"

    # Copia conversation_summaries.db se presente
    if db_sum_src.exists():
        copy_sqlite_safe(db_sum_src, db_sum_dst)

    # Copia e codifica agyhub_summaries_proto.pb
    if proto_src.exists():
        shutil.copy2(str(proto_src), str(proto_dst))
        proto_bytes = proto_src.read_bytes()
        b64_val = base64.b64encode(proto_bytes).decode("ascii")

        # Aggiornamento state.vscdb di Antigravity IDE
        if VSCDB_PATH.exists():
            backup_path = VSCDB_PATH.with_suffix(".vscdb.bak")
            shutil.copy2(str(VSCDB_PATH), str(backup_path))

            conn = sqlite3.connect(str(VSCDB_PATH), timeout=BUSY_TIMEOUT_MS / 1000.0)
            cur = conn.cursor()
            cur.execute("PRAGMA busy_timeout = 5000")
            cur.execute(
                "INSERT INTO ItemTable(key, value) VALUES(?, ?) "
                "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                (TRAJECTORY_KEY, b64_val),
            )
            conn.commit()
            conn.close()
            return True

    return False


def run_sync():
    """Punto di ingresso per eseguire la procedura completa di sincronizzazione."""
    print("Inizio sincronizzazione Antigravity 2.0 <-> Antigravity IDE...")
    conv_count = sync_conversations()
    print(f"- Conversazioni sincronizzate: {conv_count}")
    brain_count = sync_brain_folders()
    print(f"- Cartelle brain allineate: {brain_count}")
    index_updated = sync_summaries_and_index()
    print(f"- Indice globale IDE aggiornato: {'SI' if index_updated else 'NO'}")
    print("Sincronizzazione completata con successo.")


if __name__ == "__main__":
    run_sync()
