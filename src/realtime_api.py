import json
import os
from datetime import datetime
from pathlib import Path
from typing import List

import asyncpg
import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Charge les variables d'environnement (le fichier .env)
load_dotenv(override=True)
DATABASE_URL = os.getenv("DATABASE_URL")

# ---------------------------------------------------------------------------
# Database helpers (Async avec Neon PostgreSQL)
# ---------------------------------------------------------------------------

async def init_db():
    """Crée la table dans Neon si elle n'existe pas."""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS scored_clicks (
                id                     SERIAL PRIMARY KEY,
                ip                     BIGINT,
                app                    INTEGER,
                device                 INTEGER,
                os                     INTEGER,
                channel                INTEGER,
                click_time             TEXT,
                conversion_probability REAL,
                risk_score             REAL,
                decision               TEXT
            )
        """)
    finally:
        await conn.close()

async def save_click(click, conversion_probability: float, risk_score: float, decision: str):
    """Insère un clic scoré dans la base Neon."""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        await conn.execute(
            """
            INSERT INTO scored_clicks (
                ip, app, device, os, channel, click_time,
                conversion_probability, risk_score, decision
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            """,
            click.ip, click.app, click.device, click.os, click.channel, 
            click.click_time, conversion_probability, risk_score, decision
        )
    finally:
        await conn.close()

async def save_clicks_batch(data_list: list):
    """Insère plusieurs clics en une seule requête."""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        await conn.executemany(
            """
            INSERT INTO scored_clicks (
                ip, app, device, os, channel, click_time,
                conversion_probability, risk_score, decision
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            """,
            data_list
        )
    finally:
        await conn.close()

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(title="Click Fraud Detection API")

@app.on_event("startup")
async def startup():
    await init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Model & metadata loading
# ---------------------------------------------------------------------------

MODEL_PATH = "models/fraud_model.pkl"
ISO_FOREST_PATH = "models/isolation_forest.pkl"
SCALER_PATH = "models/anomaly_scaler.pkl"
METADATA_PATH = "models/metadata.json"

model = joblib.load(MODEL_PATH)
iso_forest = joblib.load(ISO_FOREST_PATH)
scaler = joblib.load(SCALER_PATH)

with open(METADATA_PATH, "r", encoding="utf-8") as f:
    metadata = json.load(f)

model_features = metadata["model_features"]
anomaly_features = metadata["anomaly_features"]

_fi_sorted: list[dict] = [
    {"feature": feat, "importance": round(float(imp), 6)}
    for feat, imp in sorted(
        zip(model_features, model.feature_importances_),
        key=lambda x: x[1],
        reverse=True,
    )
]
TOP_N_FEATURES = 5

# ---------------------------------------------------------------------------
# Input schema
# ---------------------------------------------------------------------------

class ClickInput(BaseModel):
    ip: int
    app: int
    device: int
    os: int
    channel: int
    click_time: str

# ---------------------------------------------------------------------------
# Feature engineering (Asynchrone)
# ---------------------------------------------------------------------------

async def compute_dynamic_features(click: ClickInput, click_dt: datetime) -> dict:
    defaults = {
        "ip_click_count": 1,
        "ip_hour_click_count": 1,
        "ip_app_channel_count": 1,
        "time_since_prev_click": -1.0,
        "is_rapid_click": 0,
        "unique_apps_per_ip": 1,
        "unique_channels_per_ip": 1,
        "unique_devices_per_ip": 1,
        "unique_os_per_ip": 1,
        "app_conversion_rate": 0.002,
        "channel_conversion_rate": 0.002,
        "os_conversion_rate": 0.002,
    }
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        
        ip_click_count = (await conn.fetchval("SELECT COUNT(*) FROM scored_clicks WHERE ip = $1", click.ip)) + 1
        ip_hour_click_count = (await conn.fetchval("SELECT COUNT(*) FROM scored_clicks WHERE ip = $1 AND substr(click_time, 12, 2) = $2", click.ip, f"{click_dt.hour:02d}")) + 1
        ip_app_channel_count = (await conn.fetchval("SELECT COUNT(*) FROM scored_clicks WHERE ip = $1 AND app = $2 AND channel = $3", click.ip, click.app, click.channel)) + 1
        
        prev_row = await conn.fetchrow("SELECT click_time FROM scored_clicks WHERE ip = $1 ORDER BY id DESC LIMIT 1", click.ip)
        if prev_row:
            prev_dt = datetime.fromisoformat(prev_row['click_time']).replace(tzinfo=None)
            time_since_prev_click = (click_dt - prev_dt).total_seconds()
        else:
            time_since_prev_click = -1.0

        is_rapid_click = 1 if (0 <= time_since_prev_click <= 5) else 0

        distinct_apps = {row['app'] for row in await conn.fetch("SELECT DISTINCT app FROM scored_clicks WHERE ip = $1", click.ip)}
        distinct_apps.add(click.app)
        unique_apps_per_ip = len(distinct_apps)

        distinct_channels = {row['channel'] for row in await conn.fetch("SELECT DISTINCT channel FROM scored_clicks WHERE ip = $1", click.ip)}
        distinct_channels.add(click.channel)
        unique_channels_per_ip = len(distinct_channels)

        distinct_devices = {row['device'] for row in await conn.fetch("SELECT DISTINCT device FROM scored_clicks WHERE ip = $1", click.ip)}
        distinct_devices.add(click.device)
        unique_devices_per_ip = len(distinct_devices)

        distinct_os = {row['os'] for row in await conn.fetch("SELECT DISTINCT os FROM scored_clicks WHERE ip = $1", click.ip)}
        distinct_os.add(click.os)
        unique_os_per_ip = len(distinct_os)

        app_conv = await conn.fetchval("SELECT AVG(conversion_probability) FROM scored_clicks WHERE app = $1", click.app)
        app_conversion_rate = float(app_conv) if app_conv is not None else 0.002

        channel_conv = await conn.fetchval("SELECT AVG(conversion_probability) FROM scored_clicks WHERE channel = $1", click.channel)
        channel_conversion_rate = float(channel_conv) if channel_conv is not None else 0.002

        os_conv = await conn.fetchval("SELECT AVG(conversion_probability) FROM scored_clicks WHERE os = $1", click.os)
        os_conversion_rate = float(os_conv) if os_conv is not None else 0.002

        await conn.close()

        return {
            "ip_click_count": ip_click_count,
            "ip_hour_click_count": ip_hour_click_count,
            "ip_app_channel_count": ip_app_channel_count,
            "time_since_prev_click": time_since_prev_click,
            "is_rapid_click": is_rapid_click,
            "unique_apps_per_ip": unique_apps_per_ip,
            "unique_channels_per_ip": unique_channels_per_ip,
            "unique_devices_per_ip": unique_devices_per_ip,
            "unique_os_per_ip": unique_os_per_ip,
            "app_conversion_rate": app_conversion_rate,
            "channel_conversion_rate": channel_conversion_rate,
            "os_conversion_rate": os_conversion_rate,
        }
    except Exception as e:
        print(f"Erreur features DB: {e}")
        return defaults


async def _base_row(click: ClickInput) -> dict:
    click_dt = datetime.fromisoformat(click.click_time).replace(tzinfo=None)
    features = {
        "ip": click.ip,
        "app": click.app,
        "device": click.device,
        "os": click.os,
        "channel": click.channel,
        "hour": click_dt.hour,
        "day": click_dt.day,
        "minute": click_dt.minute,
        "second": click_dt.second,
        "day_of_week": click_dt.weekday(),
        "is_night": 1 if (click_dt.hour >= 22 or click_dt.hour < 6) else 0,
    }
    dynamic_features = await compute_dynamic_features(click, click_dt)
    features.update(dynamic_features)
    return features


def _compute_anomaly(row: dict) -> tuple[float, int]:
    X_anom = pd.DataFrame([{k: row[k] for k in anomaly_features}])
    X_scaled = scaler.transform(X_anom)
    raw_score = float(iso_forest.decision_function(X_scaled)[0])
    anomaly_score = float(np.clip(0.5 - raw_score, 0.0, 1.0))
    prediction = iso_forest.predict(X_scaled)[0]
    anomaly_flag = 1 if prediction == -1 else 0
    return anomaly_score, anomaly_flag


async def build_features(click: ClickInput) -> tuple[pd.DataFrame, float, int]:
    row = await _base_row(click)
    anomaly_score, anomaly_flag = _compute_anomaly(row)
    row["anomaly_score_iso"] = anomaly_score
    row["is_anomaly_iso"] = anomaly_flag
    df = pd.DataFrame([row])
    X = df.reindex(columns=model_features)
    return X, anomaly_score, anomaly_flag


# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

def decision_from_score(score: float) -> str:
    if score >= 0.70:
        return "block"
    elif score >= 0.40:
        return "monitor"
    return "allow"


async def _score_single(click: ClickInput) -> dict:
    X, anomaly_score, anomaly_flag = await build_features(click)
    conversion_probability = float(model.predict_proba(X)[0, 1])
    low_quality_score = 1.0 - conversion_probability
    risk_score = float(np.clip(0.6 * anomaly_score + 0.4 * low_quality_score, 0.0, 1.0))
    decision = decision_from_score(risk_score)
    return {
        "conversion_probability": round(conversion_probability, 6),
        "risk_score": round(risk_score, 6),
        "anomaly_score": round(anomaly_score, 6),
        "anomaly_flag": anomaly_flag,
        "decision": decision,
        "feature_importance": _fi_sorted[:TOP_N_FEATURES],
    }

# ---------------------------------------------------------------------------
# Routes (Asynchrones)
# ---------------------------------------------------------------------------

@app.get("/")
def home():
    return {"message": "Click Fraud Detection API is running"}

@app.post("/score-click")
async def score_click(click: ClickInput):
    result = await _score_single(click)
    await save_click(click, result["conversion_probability"], result["risk_score"], result["decision"])
    return result

@app.post("/score-batch")
async def score_batch(clicks: List[ClickInput]):
    results = []
    batch_rows = []
    for click in clicks:
        result = await _score_single(click)
        results.append(result)
        batch_rows.append((
            click.ip, click.app, click.device, click.os, click.channel, click.click_time,
            result["conversion_probability"], result["risk_score"], result["decision"]
        ))
    if batch_rows:
        await save_clicks_batch(batch_rows)
    return {"results": results, "total": len(results)}

@app.get("/clicks")
async def get_clicks(limit: int = Query(default=500, ge=1, le=10_000)):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        rows = await conn.fetch(
            """
            SELECT id, ip, app, device, os, channel, click_time,
                   conversion_probability, risk_score, decision
            FROM scored_clicks
            ORDER BY id DESC
            LIMIT $1
            """,
            limit
        )
        return [{**dict(row), "id": str(row['id'])} for row in rows]
    finally:
        await conn.close()

@app.get("/stats")
async def get_stats():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        row = await conn.fetchrow("""
            SELECT
                COUNT(*)                                                 AS total,
                SUM(CASE WHEN decision = 'allow'   THEN 1 ELSE 0 END)  AS allow_count,
                SUM(CASE WHEN decision = 'monitor' THEN 1 ELSE 0 END)  AS monitor_count,
                SUM(CASE WHEN decision = 'block'   THEN 1 ELSE 0 END)  AS block_count,
                AVG(risk_score)                                          AS avg_risk_score,
                AVG(conversion_probability)                              AS avg_conversion_probability
            FROM scored_clicks
        """)
        total = row['total'] or 0
        block_count = row['block_count'] or 0
        fraud_rate = round(block_count / total, 6) if total > 0 else 0.0
        return {
            "total": total,
            "allow_count": row['allow_count'] or 0,
            "monitor_count": row['monitor_count'] or 0,
            "block_count": block_count,
            "fraud_rate": fraud_rate,
            "avg_risk_score": round(float(row['avg_risk_score'] or 0.0), 6),
            "avg_conversion_probability": round(float(row['avg_conversion_probability'] or 0.0), 6),
        }
    finally:
        await conn.close()