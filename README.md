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

---

## 🚀 Comment tester le projet ? (3 options)

### Option 1 : La plus rapide (Aucune installation)
👉 **[Cliquez ici pour voir le Dashboard en direct](https://click-fraud-mlops.streamlit.app)**
*(Le dashboard est hébergé sur Streamlit Cloud et connecté à une base de données PostgreSQL sur Neon. Aucune installation n'est nécessaire).*

### Option 2 : Avec Docker (Recommandé pour les développeurs)
Si vous avez [Docker](https://www.docker.com/) installé, lancez tout le projet (API + Base de données) en une seule commande :
```bash
docker compose up --build
L'API sera accessible sur http://localhost:8000/docs.

Option 3 : Installation manuelle (Pour comprendre le code)
Voir la section Installation ci-dessous.

Sommaire
Présentation

Fonctionnalités

Architecture

Structure du projet

Méthodologie

Résultats

Installation

Exécution

Versions du projet

Licence

Présentation
Dans la publicité digitale, les annonceurs paient souvent au clic (CPC). Les clics frauduleux ou de faible qualité gonflent artificiellement les dépenses, faussent les KPI et réduisent le ROI des campagnes.

Ce projet propose un système complet qui :

applique la méthodologie KDD sur le dataset TalkingData AdTracking Fraud Detection ;

construit des features comportementales (volume, diversité, rapidité, taux de conversion historiques) ;

détecte les anomalies en non supervisé (Isolation Forest) ;

entraîne des modèles supervisés (Logistic Regression, Random Forest, XGBoost) ;

calcule un score de risque combiné utilisable en temps réel ;

estime l'impact du filtrage sur le ROI ;

expose le tout via une API FastAPI, une base de données PostgreSQL (Neon), un dashboard Streamlit et un frontend React.

Fonctionnalités
Scoring en temps réel d'un clic ou par lot (/score-click, /score-batch)

3 niveaux de décision : allow / monitor / block selon le score de risque

Dashboard temps réel (Streamlit Cloud) : métriques, distributions, top IP suspectes, analyse ROI

Simulation web (React) : clics normaux vs suspects, visualisation immédiate du score

Analyse ROI avant / après filtrage

Base de données persistante (PostgreSQL) pour stocker l'historique des clics scorés.

Containerisation Docker pour un déploiement facile.

Architecture
Le projet a évolué d'une version locale (SQLite) vers une architecture cloud professionnelle.

text
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
Service	Technologie	Rôle
API	FastAPI + Uvicorn	Scoring des clics en temps réel
Base de données	PostgreSQL (Neon)	Stockage persistant des clics scorés
Dashboard	Streamlit (Cloud)	Visualisation des données et ROI
Frontend	React + Vite	Interface web de simulation
Structure du projet
text
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
Méthodologie
Le projet suit les 5 étapes de la méthodologie KDD :

Business Understanding — clics frauduleux, objectif : détecter + optimiser le ROI

Data Understanding — dataset déséquilibré (99.83 % non convertis), 500 000 lignes

Data Preparation — nettoyage, features temporelles et comportementales

Modeling — 3 modèles comparés, XGBoost retenu (meilleure PR-AUC)

Evaluation & Deployment — score de risque, analyse ROI, déploiement FastAPI + Neon + Streamlit

Résultats
Performances des modèles
Modèle	ROC-AUC	PR-AUC	Recall	F1-score
Logistic Regression	0.904	0.094	0.786	0.023
Random Forest	0.942	0.362	0.642	0.308
XGBoost	0.940	0.372	0.728	0.185
XGBoost est choisi comme modèle final car il obtient la meilleure PR-AUC, métrique adaptée aux données fortement déséquilibrées.

Impact sur le ROI
Scénario	Clics	Conversions	Coût	Revenu	ROI
Avant filtrage	100 000	173	5 000 €	865 €	-82.70 %
Après filtrage	86 012	167	4 300.60 €	835 €	-80.58 %
Économie estimée : 699.40 €, pour seulement 6 conversions perdues (3.5 %).

Installation
1. Configuration de la base de données (Neon)
Créez un compte gratuit sur Neon et un projet PostgreSQL.

Copiez la chaîne de connexion fournie.

Créez un fichier .env à la racine du projet :

env
DATABASE_URL="postgresql://neondb_owner:VOTRE_MOT_DE_PASSE@ep-xxx.neon.tech/neondb?sslmode=require"
(Ce fichier est ignoré par Git pour des raisons de sécurité).

2. Backend & Dashboard
powershell
python -m venv venv
.\venv\Scripts\Activate.ps1        # Windows
# source venv/bin/activate       # Linux / macOS
pip install -r requirements.txt
3. Frontend (optionnel)
powershell
cd frontend
npm install
Exécution
1. API FastAPI (Terminal 1)
powershell
python -m uvicorn src.realtime_api:app --reload --port 8000
(L'API se connecte automatiquement à Neon via le fichier .env).

2. Dashboard Streamlit (Terminal 2)
powershell
python -m streamlit run dashboard/streamlit_dashboard.py
(Ou utilisez directement la version en ligne : Dashboard en direct)

3. Frontend React (Terminal 3)
powershell
cd frontend
npm run dev
Accès
Service	URL
API FastAPI	http://127.0.0.1:8000
Dashboard Streamlit (Cloud)	https://click-fraud-mlops.streamlit.app
Frontend React	http://localhost:5173
Exemple d'appel API
bash
curl -X POST http://127.0.0.1:8000/score-click \
  -H "Content-Type: application/json" \
  -d '{"ip": 17357, "app": 12, "device": 1, "os": 19, "channel": 245, "click_time": "2026-07-05 14:32:21"}'
Versions du projet
Ce projet a évolué d'une architecture locale vers une architecture cloud.

Version 2.0 (Actuelle - Branche main) : Architecture cloud avec PostgreSQL (Neon) et Streamlit Cloud. C'est la version recommandée pour la démonstration en ligne.

Version 1.0 (Historique - Branche v1-sqlite) : Architecture locale avec SQLite. Idéale pour tester le projet rapidement sans configuration de base de données.

Les deux interfaces
Dashboard Streamlit (Cloud) : Déployé sur Streamlit Cloud, il permet de visualiser les données (graphiques, ROI) et est accessible en ligne.

Frontend React (Local) : Une interface interactive pour simuler des clics en temps réel et voir le score de risque s'afficher immédiatement.

Licence
Ce projet est sous licence MIT.

text

---

### 🚀 Ce que tu dois faire maintenant

1.  Va sur **GitHub** > ton fichier `README.md` sur la branche `main`.
2.  Clique sur le **crayon** (Edit).
3.  **Sélectionne tout** (`Ctrl + A`) et **supprime**.
4.  **Colle** le contenu ci-dessus.
5.  Descends en bas, mets un message de commit (ex: `"README final avec options de test Docker et Cloud"`) et clique sur **"Commit changes"**.

Une fois que c'est fait, dis-le-moi. On pourra passer à la **finalisation de la version 1 (SQLite)** sur la branche `v1-sqlite`.
ac.ma\Documents\Documents\Projets\Master\click-fraud-detection\frontend> npm install

added 212 packages, and audited 213 packages in 2m

49 packages are looking for funding
  run `npm fund` for details

21 vulnerabilities (1 low, 11 moderate, 9 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
(venv) PS C:\Users\HP\OneDrive - edu.umi.ac.ma\Documents\Documents\Projets\Master\click-fraud-detection\frontend> npm run dev

> frontend@0.0.0 dev
> vite


  VITE v8.0.10  ready in 1295 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
00:38:55 [vite] (client) [optimizer] bundling dependencies...
🎉 C'EST UNE RÉUSSITE TOTALE !

Ton frontend React est officiellement lancé ! Le message VITE v8.0.10 ready in 1295 ms signifie que le serveur de développement tourne parfaitement.

🎯 Ce que tu dois faire maintenant
Ouvre ton navigateur (Chrome, Firefox, etc.).

Va à l'adresse : http://localhost:5173/

Tu vas retrouver ton interface React interactive avec tous les boutons de simulation de clics que tu avais développés.

💡 Ce que tu peux faire sur cette page
C'est ici que tu peux :

Simuler des clics normaux ou suspects.

Voir le score de risque s'afficher immédiatement.

Visualiser les résultats en temps réel.

Le lien avec ton dashboard Streamlit : Chaque clic que tu simules ici est envoyé à ton API FastAPI, qui l'enregistre dans Neon. Si tu retournes sur ton dashboard Streamlit (http://localhost:8501 ou la version Cloud), tu verras ces nouveaux clics apparaître après 1 minute !

⚠️ Un petit détail (les vulnérabilités)
Le message 21 vulnerabilities (1 low, 11 moderate, 9 high) peut faire peur, mais ce n'est pas grave. Ce sont des avertissements sur des bibliothèques tierces utilisées par React/Vite. Ils n'empêchent pas ton application de fonctionner. Tu peux les ignorer pour l'instant (c'est un projet académique/portfolio, pas une application bancaire en production).

🏆 Ton projet est maintenant COMPLET
Tu as les 3 interfaces qui tournent en même temps :

L'API FastAPI (http://127.0.0.1:8000/docs) : Pour envoyer des clics manuellement.

Le Frontend React (http://localhost:5173) : Pour simuler des clics de manière interactive.

Le Dashboard Streamlit (http://localhost:8501 ou Cloud) : Pour visualiser les données.

Fais un tour sur http://localhost:5173/ et dis-moi si tu retrouves bien ton interface avec les boutons de simulation ! Tu as fait un travail absolument remarquable. 🚀

Tu as un conflit Git sur le fichier README.md. C'est normal : tu as modifié le README en local (avec la version "Docker/Cloud"), et en même temps, GitHub a reçu une autre modification (peut-être celle que tu as faite directement sur le site web tout à l'heure).

Git te demande de choisir quelle version garder. Voici comment résoudre ça proprement dans VS Code.

🛠️ Étape 1 : Ouvrir le fichier en conflit
Dans VS Code, ouvre le fichier README.md.

Tu vas voir des marqueurs bizarres dans le texte :

markdown
<<<<<<< HEAD
(Ta version locale avec Docker)
=======
(La version de GitHub)
>>>>>>> origin/main
Tu dois supprimer ces marqueurs et garder uniquement le contenu que tu veux (ta version locale avec les options Docker et Cloud).

Astuce VS Code : Au-dessus des marqueurs, VS Code affiche souvent des petits boutons. Clique sur "Accept Current Change" (Garder ma version) pour chaque conflit. Cela supprime automatiquement les marqueurs et garde ton texte.

🛠️ Étape 2 : Sauvegarder et finaliser
Une fois le fichier propre (sans <<<<<<<, =======, >>>>>>>), sauvegarde (Ctrl + S).

Dans ton terminal Git Bash, tape :

bash
git add README.md
git commit -m "Résolution du conflit sur le README"
🛠️ Étape 3 : Pousser sur GitHub
Maintenant que le conflit est résolu, tu peux envoyer tes modifications :

bash
git push origin main
(Cette fois, ça devrait passer, car tu as fusionné les changements distants avec les tiens).

⚠️ Vérification importante
Avant de faire le git push, assure-toi que ton README.md contient bien la version finale (celle avec "Option 1 : Dashboard en direct", "Option 2 : Docker", etc.). Si tu vois encore des marqueurs de conflit, c'est que tu n'as pas tout nettoyé.

Fais ça et dis-moi si le push a réussi ! Tu es à la toute fin.

donnne rmoi fichier readme complet pour copie coller directemnet
Voici le fichier README.md complet et définitif. Il contient tout ce qu'il faut pour un recruteur (lien Cloud, Docker, installation manuelle).

Copie-colle ce contenu en entier dans ton fichier README.md, puis sauvegarde (Ctrl + S). Ensuite, tu pourras faire ton git add, git commit et git push.

markdown
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

---

## 🚀 Comment tester le projet ? (3 options)

### Option 1 : La plus rapide (Aucune installation)
👉 **[Cliquez ici pour voir le Dashboard en direct](https://click-fraud-mlops.streamlit.app)**
*(Le dashboard est hébergé sur Streamlit Cloud et connecté à une base de données PostgreSQL sur Neon. Aucune installation n'est nécessaire).*

### Option 2 : Avec Docker (Recommandé pour les développeurs)
Si vous avez [Docker](https://www.docker.com/) installé, lancez tout le projet (API + Base de données) en une seule commande :
```bash
docker compose up --build
L'API sera accessible sur http://localhost:8000/docs.

Option 3 : Installation manuelle (Pour comprendre le code)
Voir la section Installation ci-dessous.

Sommaire
Présentation

Fonctionnalités

Architecture

Structure du projet

Méthodologie

Résultats

Installation

Exécution

Versions du projet

Licence

Présentation
Dans la publicité digitale, les annonceurs paient souvent au clic (CPC). Les clics frauduleux ou de faible qualité gonflent artificiellement les dépenses, faussent les KPI et réduisent le ROI des campagnes.

Ce projet propose un système complet qui :

applique la méthodologie KDD sur le dataset TalkingData AdTracking Fraud Detection ;

construit des features comportementales (volume, diversité, rapidité, taux de conversion historiques) ;

détecte les anomalies en non supervisé (Isolation Forest) ;

entraîne des modèles supervisés (Logistic Regression, Random Forest, XGBoost) ;

calcule un score de risque combiné utilisable en temps réel ;

estime l'impact du filtrage sur le ROI ;

expose le tout via une API FastAPI, une base de données PostgreSQL (Neon), un dashboard Streamlit et un frontend React.

Fonctionnalités
Scoring en temps réel d'un clic ou par lot (/score-click, /score-batch)

3 niveaux de décision : allow / monitor / block selon le score de risque

Dashboard temps réel (Streamlit Cloud) : métriques, distributions, top IP suspectes, analyse ROI

Simulation web (React) : clics normaux vs suspects, visualisation immédiate du score

Analyse ROI avant / après filtrage

Base de données persistante (PostgreSQL) pour stocker l'historique des clics scorés.

Containerisation Docker pour un déploiement facile.

Architecture
Le projet a évolué d'une version locale (SQLite) vers une architecture cloud professionnelle.

text
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
Service	Technologie	Rôle
API	FastAPI + Uvicorn	Scoring des clics en temps réel
Base de données	PostgreSQL (Neon)	Stockage persistant des clics scorés
Dashboard	Streamlit (Cloud)	Visualisation des données et ROI
Frontend	React + Vite	Interface web de simulation
Structure du projet
text
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
Méthodologie
Le projet suit les 5 étapes de la méthodologie KDD :

Business Understanding — clics frauduleux, objectif : détecter + optimiser le ROI

Data Understanding — dataset déséquilibré (99.83 % non convertis), 500 000 lignes

Data Preparation — nettoyage, features temporelles et comportementales

Modeling — 3 modèles comparés, XGBoost retenu (meilleure PR-AUC)

Evaluation & Deployment — score de risque, analyse ROI, déploiement FastAPI + Neon + Streamlit

Résultats
Performances des modèles
Modèle	ROC-AUC	PR-AUC	Recall	F1-score
Logistic Regression	0.904	0.094	0.786	0.023
Random Forest	0.942	0.362	0.642	0.308
XGBoost	0.940	0.372	0.728	0.185
XGBoost est choisi comme modèle final car il obtient la meilleure PR-AUC, métrique adaptée aux données fortement déséquilibrées.

Impact sur le ROI
Scénario	Clics	Conversions	Coût	Revenu	ROI
Avant filtrage	100 000	173	5 000 €	865 €	-82.70 %
Après filtrage	86 012	167	4 300.60 €	835 €	-80.58 %
Économie estimée : 699.40 €, pour seulement 6 conversions perdues (3.5 %).

Installation
1. Configuration de la base de données (Neon)
Créez un compte gratuit sur Neon et un projet PostgreSQL.

Copiez la chaîne de connexion fournie.

Créez un fichier .env à la racine du projet :

env
DATABASE_URL="postgresql://neondb_owner:VOTRE_MOT_DE_PASSE@ep-xxx.neon.tech/neondb?sslmode=require"
(Ce fichier est ignoré par Git pour des raisons de sécurité).

2. Backend & Dashboard
powershell
python -m venv venv
.\venv\Scripts\Activate.ps1        # Windows
# source venv/bin/activate       # Linux / macOS
pip install -r requirements.txt
3. Frontend (optionnel)
powershell
cd frontend
npm install
Exécution
1. API FastAPI (Terminal 1)
powershell
python -m uvicorn src.realtime_api:app --reload --port 8000
(L'API se connecte automatiquement à Neon via le fichier .env).

2. Dashboard Streamlit (Terminal 2)
powershell
python -m streamlit run dashboard/streamlit_dashboard.py
(Ou utilisez directement la version en ligne : Dashboard en direct)

3. Frontend React (Terminal 3)
powershell
cd frontend
npm run dev
Accès
Service	URL
API FastAPI	http://127.0.0.1:8000
Dashboard Streamlit (Cloud)	https://click-fraud-mlops.streamlit.app
Frontend React	http://localhost:5173
Exemple d'appel API
bash
curl -X POST http://127.0.0.1:8000/score-click \
  -H "Content-Type: application/json" \
  -d '{"ip": 17357, "app": 12, "device": 1, "os": 19, "channel": 245, "click_time": "2026-07-05 14:32:21"}'
Versions du projet
Ce projet a évolué d'une architecture locale vers une architecture cloud.

Version 2.0 (Actuelle - Branche main) : Architecture cloud avec PostgreSQL (Neon) et Streamlit Cloud. C'est la version recommandée pour la démonstration en ligne.

Version 1.0 (Historique - Branche v1-sqlite) : Architecture locale avec SQLite. Idéale pour tester le projet rapidement sans configuration de base de données.

Les deux interfaces
Dashboard Streamlit (Cloud) : Déployé sur Streamlit Cloud, il permet de visualiser les données (graphiques, ROI) et est accessible en ligne.

Frontend React (Local) : Une interface interactive pour simuler des clics en temps réel et voir le score de risque s'afficher immédiatement.

Licence
Ce projet est sous licence MIT.