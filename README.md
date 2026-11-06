Bien sûr ! Voici le **README complet et mis à jour** pour ta version 2 (Neon + Cloud). Tu peux tout copier-coller directement dans ton fichier `README.md` sur GitHub.

---

```markdown
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
![License](https://img.shields.io/badge/License-MIT-green)

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
9. [Documentation](#documentation)
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
└── docs/                  # Documentation détaillée
    ├── methodologie.md    # Rapport méthodologique complet
    └── guide_windows.md   # Guide d'installation Windows
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

### Backend & Base de données

1. **Cloner le dépôt** et créer un environnement virtuel :
   ```powershell
   python -m venv .venv
   .venv\Scripts\Activate.ps1        # Windows
   # source .venv/bin/activate       # Linux / macOS
   pip install -r requirements.txt
   ```

2. **Configuration de la base de données (Neon)** :
   - Créez un compte gratuit sur [Neon](https://neon.tech) et un projet PostgreSQL.
   - Copiez la chaîne de connexion fournie.
   - Créez un fichier `.env` à la racine du projet :
     ```env
     DATABASE_URL="postgresql://neondb_owner:VOTRE_MOT_DE_PASSE@ep-xxx.neon.tech/neondb?sslmode=require"
     ```
   - *(Ce fichier est ignoré par Git pour des raisons de sécurité).*

### Frontend (optionnel)

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
streamlit run dashboard/streamlit_dashboard.py
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

## Documentation

- [docs/methodologie.md](docs/methodologie.md) — rapport méthodologique complet (KDD, features, modèles, score de risque, ROI, questions de soutenance)
- [docs/guide_windows.md](docs/guide_windows.md) — guide d'installation et d'exécution détaillé (Windows)

## Licence

Ce projet est sous licence [MIT](LICENSE).
```

---

### 🚀 Ce que tu dois faire maintenant :

1.  Va sur **GitHub** > ton fichier `README.md` sur la branche `main`.
2.  Clique sur le **crayon** (Edit).
3.  **Sélectionne tout** (`Ctrl + A`) et **supprime**.
4.  **Colle** le contenu ci-dessus.
5.  Descends en bas, mets un message de commit (ex: `"Mise à jour README v2 (Neon/Cloud)"`) et clique sur **"Commit changes"**.

Une fois que c'est fait, dis-le-moi, et on passera à la finalisation de la **version 1 (SQLite)** sur la branche `v1-sqlite`.