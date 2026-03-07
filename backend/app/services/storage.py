"""
SQLite persistence for targets and scan reports.
"""

import json
import os
import sqlite3
from pathlib import Path

DB_ENV = "SHADOWLAB_DB_PATH"
DEFAULT_DB_NAME = "shadowlab.db"
MAX_REPORTS = int(os.getenv("SHADOWLAB_MAX_REPORTS", "50"))


def _db_path() -> Path:
    configured = os.getenv(DB_ENV, "").strip()
    if configured:
        return Path(configured)
    return Path(__file__).resolve().parents[2] / DEFAULT_DB_NAME


def _connect() -> sqlite3.Connection:
    path = _db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS targets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                base_url TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                method TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                payload TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()


def save_target(target: dict) -> dict:
    init_db()
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO targets (id, name, base_url, endpoint, method)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                base_url=excluded.base_url,
                endpoint=excluded.endpoint,
                method=excluded.method,
                updated_at=CURRENT_TIMESTAMP
            """,
            (
                target["id"],
                target["name"],
                target["base_url"],
                target["endpoint"],
                target.get("method", "POST"),
            ),
        )
        conn.commit()
    return target


def get_target(target_id: str) -> dict | None:
    init_db()
    with _connect() as conn:
        row = conn.execute(
            "SELECT id, name, base_url, endpoint, method FROM targets WHERE id = ?",
            (target_id,),
        ).fetchone()
    return dict(row) if row else None


def list_targets() -> list[dict]:
    init_db()
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT id, name, base_url, endpoint, method
            FROM targets
            ORDER BY updated_at DESC, id ASC
            """
        ).fetchall()
    return [dict(r) for r in rows]


def save_report(report: dict) -> None:
    init_db()
    payload = json.dumps(report, ensure_ascii=True)
    with _connect() as conn:
        conn.execute("INSERT INTO reports (payload) VALUES (?)", (payload,))
        conn.execute(
            """
            DELETE FROM reports
            WHERE id NOT IN (
                SELECT id FROM reports
                ORDER BY id DESC
                LIMIT ?
            )
            """,
            (MAX_REPORTS,),
        )
        conn.commit()


def list_reports(limit: int = 20) -> list[dict]:
    init_db()
    bounded = min(max(1, limit), MAX_REPORTS)
    with _connect() as conn:
        rows = conn.execute(
            "SELECT payload FROM reports ORDER BY id DESC LIMIT ?",
            (bounded,),
        ).fetchall()
    out: list[dict] = []
    for row in rows:
        try:
            value = json.loads(row["payload"])
        except Exception:
            continue
        if isinstance(value, dict):
            out.append(value)
    return out
