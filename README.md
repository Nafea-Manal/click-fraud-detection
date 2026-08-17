# Détection de clics suspects & optimisation du ROI publicitaire

> Système web intelligent de détection de clics suspects dans les campagnes publicitaires digitales, construit selon la méthodologie **KDD** (Knowledge Discovery in Databases).

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![Machine Learning](https://img.shields.io/badge/ML-XGBoost%20%7C%20Isolation%20Forest-FF6F00)
![Backend](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react)
![Dashboard](https://img.shields.io/badge/Dashboard-Streamlit-FF4B4B?logo=streamlit)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Sommaire

1. [Présentation](#présentation)
2. [Fonctionnalités](#fonctionnalités)
3. [Architecture](#architecture)
4. [Structure du projet](#structure-du-projet)
5. [Méthodologie](#méthodologie)
6. [Résultats](#résultats)
7. [Prérequis](#prérequis)
8. [Installation](#installation)
9. [Exécution](#exécution)
10. [Documentation](#documentation)
11. [Licence](#licence)

---

## Présentation

Dans la publicité digitale, les annonceurs paient souvent **au clic** (CPC). Les clics frauduleux ou de faible qualité gonflent artificiellement les dépenses, faussent les KPI et réduisent le **ROI** des campagnes.

Ce projet propose un **système complet** qui :

- applique la méthodologie **KDD** sur le dataset [TalkingData AdTracking Fraud Detection](https://www.kaggle.com/c/talkingdata-adtracking-fraud-detection) ;
- construit des **features comportementales** (volume, diversité, rapidité, taux de conversion historiques) ;
- détecte les anomalies en **non supervisé** (Isolation Forest) ;
- entraîne des **modèles supervisés** (Logistic Regression, Random Forest, XGBoost) ;
- calcule un **score de risque** combiné utilisable en temps réel ;
- estime l'**impact du filtrage sur le ROI** ;
- expose le tout via une **API FastAPI**, un **dashboard Streamlit** et un **frontend React**.

## Fonctionnalités

- **Scoring en temps réel** d'un clic ou par lot (`/score-click`, `/score-batch`)
- **3 niveaux de décision** : `allow` / `monitor` / `block` selon le score de risque
- **Dashboard temps réel** (Streamlit) : métriques, distributions, top IP suspectes, analyse ROI
- **Simulation web** (React) : clics normaux vs suspects, visualisation immédiate du score
- **Analyse ROI** avant / après filtrage

## Architecture

```text
Dataset TalkingData
        │
        ▼
Notebook KDD (exploration, prétraitement, features)
        │  exports modèles .pkl + metadata.json
        ▼
API FastAPI (port 8000)  ──► SQLite (click_logs.db)
        │
   ┌────┴────┐
   ▼         ▼
Frontend    Dashboard
React       Streamlit
(5173)      (8501)
```

| Service | Technologie | Port | Rôle |
|---------|-------------|------|------|
| API | FastAPI + Uvicorn | 8000 | Scoring des clics en temps réel |
| Dashboard | Streamlit | 8501 | Visualisation des données et ROI |
| Frontend | React + Vite | 5173 | Interface web de simulation |

## Structure du projet

```text
.
├── data/                  # Dataset (placeholder — voir note ci-dessous)
├── notebooks/             # Notebook KDD (entraînement des modèles)
├── src/                   # Code source : API, features, prétraitement, entraînement
│   ├── realtime_api.py    # API FastAPI
│   ├── feature_engineering.py
│   ├── preprocessing.py
│   ├── train_model.py
│   ├── roi_analysis.py
│   └── database.py
├── dashboard/             # Dashboard Streamlit
├── frontend/              # Frontend React + TypeScript + Tailwind
├── web/                   # Page HTML de test
├── models/                # Modèles entraînés (.pkl) + metadata.json
├── figures/               # Graphiques générés
├── tables/                # Tableaux de résultats (CSV / JSON)
├── outputs/               # Rapport final PDF + exports
└── docs/                  # Documentation détaillée
    ├── methodologie.md    # Rapport méthodologique complet
    └── guide_windows.md   # Guide d'installation Windows
```

> **Note dataset** : le fichier `data/click_fraud_dataset.csv` est un placeholder. Le dataset TalkingData complet (~200 Mo d'échantillon) est disponible sur [Kaggle](https://www.kaggle.com/c/talkingdata-adtracking-fraud-detection/data) et doit être téléchargé séparément pour ré-entraîner les modèles.

## Méthodologie

Le projet suit les 5 étapes de la méthodologie **KDD** :

1. **Business Understanding** — clics frauduleux, objectif : détecter + optimiser le ROI
2. **Data Understanding** — dataset déséquilibré (99.83 % non convertis), 500 000 lignes
3. **Data Preparation** — nettoyage, features temporelles et comportementales
4. **Modeling** — 3 modèles comparés, XGBoost retenu (meilleure PR-AUC)
5. **Evaluation & Deployment** — score de risque, analyse ROI, déploiement FastAPI

## Résultats

### Performances des modèles

| Modèle | ROC-AUC | PR-AUC | Recall | F1-score |
|--------|---------|--------|--------|----------|
| Logistic Regression | 0.904 | 0.094 | 0.786 | 0.023 |
| Random Forest | 0.942 | 0.362 | 0.642 | 0.308 |
| **XGBoost** | **0.940** | **0.372** | **0.728** | **0.185** |

XGBoost est choisi comme modèle final car il obtient la **meilleure PR-AUC**, métrique adaptée aux données fortement déséquilibrées.

### Impact sur le ROI

| Scénario | Clics | Conversions | Coût | Revenu | ROI |
|----------|-------|-------------|------|--------|-----|
| Avant filtrage | 100 000 | 173 | 5 000 € | 865 € | -82.70 % |
| Après filtrage | 86 012 | 167 | 4 300.60 € | 835 € | -80.58 % |

Économie estimée : **699.40 €**, pour seulement 6 conversions perdues (3.5 %).

## Prérequis

- **Python 3.11+**
- **Node.js 18+** (pour le frontend React)
- Les modèles pré-entraînés sont fournis dans `models/`

## Installation

### Backend

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows
# source .venv/bin/activate       # Linux / macOS

python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend

```powershell
cd frontend
npm install
```

> ⚠️ Sur Windows, si une erreur de politique d'exécution apparaît :
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

## Exécution

### 1. API FastAPI (Terminal 1)

```powershell
uvicorn src.realtime_api:app --reload --port 8000
```

### 2. Dashboard Streamlit (Terminal 2)

```powershell
streamlit run dashboard/streamlit_dashboard.py
```

### 3. Frontend React (Terminal 3)

```powershell
cd frontend
npm run dev
```

### 4. Page HTML de test (optionnel)

```powershell
python -m http.server 8080 -d web
```

### Accès

| Service | URL |
|---------|-----|
| API FastAPI | http://127.0.0.1:8000 |
| Dashboard Streamlit | http://localhost:8501 |
| Frontend React | http://localhost:5173 |
| Page HTML | http://localhost:8080 |

### Exemple d'appel API

```bash
curl -X POST http://127.0.0.1:8000/score-click \
  -H "Content-Type: application/json" \
  -d '{"ip": 17357, "app": 12, "device": 1, "os": 19, "channel": 245, "click_time": "2026-07-05 14:32:21"}'
```

## Documentation

- [docs/methodologie.md](docs/methodologie.md) — rapport méthodologique complet (KDD, features, modèles, score de risque, ROI, questions de soutenance)
- [docs/guide_windows.md](docs/guide_windows.md) — guide d'installation et d'exécution détaillé (Windows)

## Licence

Ce projet est sous licence [MIT](LICENSE).