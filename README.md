# Détection de clics suspects & optimisation du ROI publicitaire

> 🚀 **[Accéder au Dashboard en direct](https://click-fraud-mlops.streamlit.app)** 
> 
> Système web intelligent de détection de clics suspects dans les campagnes publicitaires digitales, construit selon la méthodologie **KDD** (Knowledge Discovery in Databases).

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![Machine Learning](https://img.shields.io/badge/ML-XGBoost%20%7C%20Isolation%20Forest-FF6F00)
![Backend](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi)
![Database](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-336791?logo=postgresql)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react)
![Dashboard](https://img.shields.io/badge/Dashboard-Streamlit%20Cloud-FF4B4B?logo=streamlit)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Comment tester le projet ? (3 options)

### Option 1 : La plus rapide (Aucune installation)
👉 **[Cliquez ici pour voir le Dashboard en direct](https://click-fraud-mlops.streamlit.app)**
*(Le dashboard est hébergé sur Streamlit Cloud et connecté à une base de données PostgreSQL sur Neon. Aucune installation n'est nécessaire).*

### Option 2 : Avec Docker (Recommandé pour les développeurs)
Si vous avez [Docker](https://www.docker.com/) installé, lancez tout le projet (API + Base de données) en une seule commande :
```bash
docker compose up --build
```
L'API sera accessible sur `http://localhost:8000/docs`.

### Option 3 : Installation manuelle (Pour comprendre le code)
Voir la section [Installation](#installation) ci-dessous.

---

## Sommaire

1. [Présentation](#présentation)
2. [Fonctionnalités](#fonctionnalités)
3. [Architecture](#architecture)
4. [Structure du projet](#structure-du-projet)
5. [Méthodologie](#méthodologie)
6. [Résultats](#résultats)
7. [Installation](#installation)
8. [Exécution](#exécution)
9. [Versions du projet](#versions-du-projet)
10. [Licence](#licence)

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
- expose le tout via une **API FastAPI**, une **base de données PostgreSQL (Neon)**, un **dashboard Streamlit** et un **frontend React**.

## Fonctionnalités

- **Scoring en temps réel** d'un clic ou par lot (`/score-click`, `/score-batch`)
- **3 niveaux de décision** : `allow` / `monitor` / `block` selon le score de risque
- **Dashboard temps réel** (Streamlit Cloud) : métriques, distributions, top IP suspectes, analyse ROI
- **Simulation web** (React) : clics normaux vs suspects, visualisation immédiate du score
- **Analyse ROI** avant / après filtrage
- **Base de données persistante** (PostgreSQL) pour stocker l'historique des clics scorés.
- **Containerisation Docker** pour un déploiement facile.

## Architecture

Le projet a évolué d'une version locale (SQLite) vers une architecture cloud professionnelle.

```text
Dataset TalkingData
        │
        ▼
Notebook KDD (exploration, prétraitement, features)
        │  exports modèles .pkl + metadata.json
        ▼
API FastAPI (Local)  ──── écrit ────►  Base PostgreSQL (Neon Cloud)
        │                                        │
        │                                        │
        ▼                                        ▼
Modèle XGBoost                        Dashboard Streamlit (Cloud)
        │                                        │
        └────────────── lit ────────────────────┘
```

| Service | Technologie | Rôle |
|---------|-------------|------|
| API | FastAPI + Uvicorn | Scoring des clics en temps réel |
| Base de données | PostgreSQL (Neon) | Stockage persistant des clics scorés |
| Dashboard | Streamlit (Cloud) | Visualisation des données et ROI |
| Frontend | React + Vite | Interface web de simulation |

## Structure du projet

```text
.
├── .streamlit/            # Configuration Streamlit (secrets)
├── data/                  # Dataset (placeholder)
├── notebooks/             # Notebook KDD (entraînement des modèles)
├── src/                   # Code source : API, features, prétraitement, entraînement
│   ├── realtime_api.py    # API FastAPI (connectée à Neon)
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
├── docs/                  # Documentation détaillée
├── Dockerfile             # Image Docker pour l'API
├── docker-compose.yml     # Orchestration API + PostgreSQL local
└── requirements.txt       # Dépendances Python
```

## Méthodologie

Le projet suit les 5 étapes de la méthodologie **KDD** :

1. **Business Understanding** — clics frauduleux, objectif : détecter + optimiser le ROI
2. **Data Understanding** — dataset déséquilibré (99.83 % non convertis), 500 000 lignes
3. **Data Preparation** — nettoyage, features temporelles et comportementales
4. **Modeling** — 3 modèles comparés, XGBoost retenu (meilleure PR-AUC)
5. **Evaluation & Deployment** — score de risque, analyse ROI, déploiement FastAPI + Neon + Streamlit

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

## Installation

### 1. Configuration de la base de données (Neon)
1. Créez un compte gratuit sur [Neon](https://neon.tech) et un projet PostgreSQL.
2. Copiez la chaîne de connexion fournie.
3. Créez un fichier `.env` à la racine du projet :
   ```env
   DATABASE_URL="postgresql://neondb_owner:VOTRE_MOT_DE_PASSE@ep-xxx.neon.tech/neondb?sslmode=require"
   ```
   *(Ce fichier est ignoré par Git pour des raisons de sécurité).*

### 2. Backend & Dashboard
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1        # Windows
# source venv/bin/activate       # Linux / macOS
pip install -r requirements.txt
```

### 3. Frontend (optionnel)
```powershell
cd frontend
npm install
```

## Exécution

### 1. API FastAPI (Terminal 1)
```powershell
python -m uvicorn src.realtime_api:app --reload --port 8000
```
*(L'API se connecte automatiquement à Neon via le fichier `.env`).*

### 2. Dashboard Streamlit (Terminal 2)
```powershell
python -m streamlit run dashboard/streamlit_dashboard.py
```
*(Ou utilisez directement la version en ligne : [Dashboard en direct](https://click-fraud-mlops.streamlit.app))*

### 3. Frontend React (Terminal 3)
```powershell
cd frontend
npm run dev
```

### Accès

| Service | URL |
|---------|-----|
| API FastAPI | http://127.0.0.1:8000 |
| Dashboard Streamlit (Cloud) | https://click-fraud-mlops.streamlit.app |
| Frontend React | http://localhost:5173 |

### Exemple d'appel API
```bash
curl -X POST http://127.0.0.1:8000/score-click \
  -H "Content-Type: application/json" \
  -d '{"ip": 17357, "app": 12, "device": 1, "os": 19, "channel": 245, "click_time": "2026-07-05 14:32:21"}'
```

## Versions du projet

Ce projet a évolué d'une architecture locale vers une architecture cloud.

- **Version 2.0 (Actuelle - Branche `main`)** : Architecture cloud avec **PostgreSQL (Neon)** et **Streamlit Cloud**. C'est la version recommandée pour la démonstration en ligne.
- **Version 1.0 (Historique - Branche `v1-sqlite`)** : Architecture locale avec **SQLite**. Idéale pour tester le projet rapidement sans configuration de base de données.

### Les deux interfaces
1. **Dashboard Streamlit (Cloud)** : Déployé sur Streamlit Cloud, il permet de visualiser les données (graphiques, ROI) et est accessible en ligne.
2. **Frontend React (Local)** : Une interface interactive pour simuler des clics en temps réel et voir le score de risque s'afficher immédiatement.

## Licence

Ce projet est sous licence [MIT](LICENSE).
