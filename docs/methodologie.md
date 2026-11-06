# Projet Data Mining : Détection de clics suspects et optimisation du ROI publicitaire

---

## Table des matières

1. [Contexte et objectifs](#1-contexte-et-objectifs)
2. [Architecture générale](#2-architecture-générale)
3. [Méthodologie KDD étape par étape](#3-méthodologie-kdd-étape-par-étape)
4. [Le dataset TalkingData](#4-le-dataset-talkingdata)
5. [Prétraitement et Feature Engineering](#5-prétraitement-et-feature-engineering)
6. [Détection d'anomalies (Isolation Forest)](#6-détection-danomalies-isolation-forest)
7. [Modélisation supervisée](#7-modélisation-supervisée)
8. [Score de risque et décision](#8-score-de-risque-et-décision)
9. [Analyse ROI](#9-analyse-roi)
10. [L'API FastAPI](#10-lapi-fastapi)
11. [Le Dashboard Streamlit](#11-le-dashboard-streamlit)
12. [Le Frontend React](#12-le-frontend-react)
13. [Comment tout exécuter](#13-comment-tout-exécuter)
14. [Limites du projet](#14-limites-du-projet)
15. [Questions potentielles du prof](#15-questions-potentielles-du-prof)

---

## 1. Contexte et objectifs

### Contexte métier

Dans la publicité digitale, les annonceurs paient souvent **au clic** (CPC = Cost Per Click). Des clics frauduleux ou de faible qualité peuvent :

- Gonfler artificiellement les dépenses publicitaires
- Fausser les indicateurs de performance (KPI)
- Diminuer le retour sur investissement (ROI)
- Réduire la confiance dans les campagnes

### Objectif général

Développer un **système web intelligent** capable de détecter les clics suspects en temps réel et d'estimer l'impact du filtrage sur le ROI marketing.

### Objectifs spécifiques

1. Appliquer la méthodologie **KDD** (Knowledge Discovery in Databases)
2. Analyser un dataset réel de click tracking (TalkingData)
3. Créer des **variables comportementales** (feature engineering)
4. Utiliser **l'Isolation Forest** pour détecter des anomalies non supervisées
5. Entraîner des **modèles supervisés** (XGBoost, Random Forest, Logistic Regression)
6. Produire un **score de risque** utilisable par une API temps réel
7. Calculer le **ROI** avant/après filtrage
8. Déployer le tout via **API FastAPI + Dashboard Streamlit + Frontend React**

---

## 2. Architecture générale

```
┌─────────────────────────────────────────────────────────────┐
│                  Notebook KDD (entraînement)                 │
│  Exploration → Prétraitement → Feature Engineering →         │
│  Isolation Forest → Modèles supervisés → ROI → Export       │
└──────────────┬──────────────────────────────────────────────┘
               │ Exporte les modèles .pkl + metadata.json
               ▼
┌─────────────────────────────────────────────────────────────┐
│                   API FastAPI (Port 8000)                     │
│  src/realtime_api.py                                         │
│  Routes : /score-click, /score-batch, /clicks, /stats       │
│  Charge les modèles au démarrage                             │
│  Stocke les résultats dans SQLite (click_logs.db)            │
└──────────────┬──────────────────────────────────────────────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
┌──────────────┐  ┌──────────────┐
│ Frontend     │  │ Dashboard    │
│ React (5173) │  │ Streamlit    │
│ Simulation   │  │ (8501)       │
│ de clics     │  │ Stats + ROI  │
└──────────────┘  └──────────────┘
```

**3 services à lancer :**
| Service | Technologie | Port | Rôle |
|---------|------------|------|------|
| API | FastAPI + Uvicorn | 8000 | Scoring des clics en temps réel |
| Dashboard | Streamlit | 8501 | Visualisation des données et ROI |
| Frontend | React + Vite | 5173 | Interface web de simulation |

---

## 3. Méthodologie KDD étape par étape

Le projet suit la méthodologie **KDD** (Knowledge Discovery in Databases) en 5 étapes :

### Étape 1 : Business Understanding
- Comprendre le problème : clics frauduleux dans la publicité digitale
- Définir les objectifs : détecter les clics suspects, optimiser le ROI
- Contrainte : pas de label "fraude" mais uniquement "conversion" (is_attributed)

### Étape 2 : Data Understanding
- Chargement du dataset TalkingData
- Analyse des dimensions, types, valeurs manquantes
- Statistiques descriptives, distribution de la cible
- Visualisation des clics par heure, top IP, top apps

### Étape 3 : Data Preparation
- Nettoyage : suppression des lignes avec click_time manquant
- Feature engineering temporel (hour, day, dayofweek, minute)
- Feature engineering comportemental (voir section 5)
- Détection d'anomalies avec Isolation Forest

### Étape 4 : Modeling
- 3 modèles comparés : Logistic Regression, Random Forest, XGBoost
- Split train/test stratifié (80/20)
- Métriques adaptées au déséquilibre : PR-AUC, Recall, F1-score, ROC-AUC
- XGBoost choisi comme modèle final (meilleur PR-AUC)

### Étape 5 : Evaluation & Deployment
- Création du score de risque combiné
- Analyse ROI simulée
- Export des artefacts (modèles, scalers, metadata)
- Déploiement via API FastAPI

---

## 4. Le dataset TalkingData

### Source
TalkingData AdTracking Fraud Detection Challenge (Kaggle)

### Colonnes

| Colonne | Type | Description |
|---------|------|-------------|
| `ip` | int | Identifiant anonymisé de l'adresse IP |
| `app` | int | Identifiant de l'application |
| `device` | int | Type d'appareil |
| `os` | int | Système d'exploitation |
| `channel` | int | Canal publicitaire |
| `click_time` | datetime | Horodatage du clic |
| `attributed_time` | datetime | Horodatage de conversion (si elle a eu lieu) |
| `is_attributed` | int (0/1) | **Cible** : 1 si conversion, 0 sinon |

### Statistiques clés

- **500 000 lignes** chargées (échantillon du dataset complet)
- **99.83%** non convertis (is_attributed=0)
- **0.17%** convertis (is_attributed=1) → extrêmement déséquilibré
- **14 008 doublons**
- **31 395 IPs** uniques
- **182 apps**, **171 devices**, **145 channels**, **136 OS**
- `attributed_time` : **99.8%** de valeurs manquantes (car très peu de conversions)

### Distribution des clics par IP

| IP | Clics | Particularité |
|----|-------|---------------|
| 73487 | 3296 | Volume très élevé |
| 73516 | 3133 | 0 conversion, clics très rapides → suspect |
| 5314 | 1733 | Volume élevé |
| ... | ... | ... |

### Interprétation
- **is_attributed=1** : clic converti → bonne qualité
- **is_attributed=0** : clic non converti → ne signifie PAS automatiquement fraude, mais faible qualité potentielle

---

## 5. Prétraitement et Feature Engineering

### Prétraitement temporel
```python
df["hour"] = df["click_time"].dt.hour
df["day"] = df["click_time"].dt.day
df["minute"] = df["click_time"].dt.minute
df["dayofweek"] = df["click_time"].dt.dayofweek
```

### Variables temporelles créées
| Feature | Description |
|---------|-------------|
| `hour` | Heure du clic (0-23) |
| `day` | Jour du mois |
| `minute` | Minute (0-59) |
| `dayofweek` | Jour de la semaine (0=Lundi, 6=Dimanche) |
| `is_night` | 1 si heure ≥ 22 ou < 6 |

### Feature engineering comportemental

C'est le **cœur du projet**. On crée des variables qui décrivent le **comportement** des clics plutôt que d'utiliser les variables brutes directement.

#### Features de volume
| Feature | Description |
|---------|-------------|
| `ip_click_count` | Nombre total de clics de la même IP |
| `ip_hour_click_count` | Clics de la même IP durant la même heure |
| `ip_app_channel_count` | Clics de la même IP sur la même app + channel |
| `app_click_count` | Nombre total de clics sur la même app |
| `channel_click_count` | Nombre total de clics sur le même channel |

#### Features de diversité
| Feature | Description |
|---------|-------------|
| `unique_apps_per_ip` | Nombre d'apps différentes utilisées par la même IP |
| `unique_channels_per_ip` | Nombre de channels différents utilisés par la même IP |
| `unique_devices_per_ip` | Nombre de devices différents utilisés par la même IP |
| `unique_os_per_ip` | Nombre d'OS différents utilisés par la même IP |

#### Features temporelles comportementales
| Feature | Description |
|---------|-------------|
| `time_since_prev_click` | Temps écoulé depuis le dernier clic de la même IP (en secondes) |
| `is_rapid_click` | 1 si le temps depuis le clic précédent est ≤ 5 secondes |
| `app_conversion_rate` | Taux de conversion historique de l'application |
| `channel_conversion_rate` | Taux de conversion historique du channel |
| `os_conversion_rate` | Taux de conversion historique de l'OS |

### Analyse comparative : convertis vs non-convertis

| Feature | Non-convertis | Convertis | Écart |
|---------|---------------|-----------|-------|
| ip_click_count | 157.78 | 70.03 | **-87.75** |
| ip_hour_click_count | 157.64 | 70.00 | **-87.64** |
| time_since_prev_click_sec | 15.72 | 20.51 | **+4.79** |
| very_fast_repeat_click | 0.648 | 0.275 | **-0.372** |
| ip_unique_apps | 12.38 | 6.36 | **-6.02** |

**Conclusion :** Les clics convertis ont significativement **moins de volume**, **plus de diversité modérée**, et **plus de temps** entre les clics. Les clics suspects ont des volumes anormalement élevés et des répétitions très rapides.

---

## 6. Détection d'anomalies (Isolation Forest)

### Principe
L'**Isolation Forest** est un algorithme non supervisé qui isole les anomalies en les séparant plus facilement du reste des données. Contrairement à d'autres méthodes qui "apprennent" le comportement normal, l'Isolation Forest cherche directement ce qui est rare et différent.

### Pourquoi Isolation Forest ?
- Pas besoin de labels (on n'a pas de label "fraude" certaine)
- Rapide et scalable (s'adapte bien aux gros volumes)
- Produit un score d'anomalie continu (pas juste une classification binaire)
- Peu de paramètres à régler

### Paramètres utilisés
```python
IsolationForest(
    n_estimators=200,      # 200 arbres
    contamination=0.03,    # On s'attend à 3% d'anomalies
    random_state=42
)
```

### Features utilisées pour l'anomalie
Les features d'anomalie sont les features comportementales et temporelles :
- `hour`, `day_of_week`, `is_night`
- `ip_click_count`, `ip_hour_click_count`, `ip_app_channel_count`
- `time_since_prev_click`, `is_rapid_click`
- `unique_apps_per_ip`, `unique_channels_per_ip`
- `unique_devices_per_ip`, `unique_os_per_ip`

### Interprétation du score
```python
anomaly_score = clip(0.5 - decision_function(X), 0, 1)
```
- Score proche de **1.0** → très anormal
- Score proche de **0.5** → limite
- Score proche de **0.0** → normal

### Résultat : IP 73516
Cette IP a 3133 clics, 0 conversion, avec des intervalles de 1 seconde → détectée comme très anormale par l'Isolation Forest.

---

## 7. Modélisation supervisée

### Préparation des données
- **X** : 26 features (temporelles + comportementales + anomaly)
- **y** : is_attributed (0/1)
- **Split** : 80% train / 20% test, stratifié sur y
- **Déséquilibre** : scale_pos_weight = négatifs / positifs (pour XGBoost)

### Les 3 modèles comparés

#### Logistic Regression (baseline)
- Modèle linéaire simple, interprétable
- Utilise `class_weight="balanced"` pour gérer le déséquilibre
- Nécessite un StandardScaler (normalisation des features)

#### Random Forest
- Modèle non linéaire, ensemble d'arbres de décision
- Paramètres : 200 arbres, profondeur max 16, min_samples_leaf=20
- `class_weight="balanced_subsample"` pour le déséquilibre

#### XGBoost (modèle choisi)
- Gradient boosting, très performant sur données tabulaires
- Paramètres : 250 arbres, learning_rate=0.05, max_depth=6
- `scale_pos_weight` calculé automatiquement pour équilibrer les classes

### Résultats comparatifs

| Modèle | ROC-AUC | PR-AUC | Precision | Recall | F1-score |
|--------|---------|--------|-----------|--------|----------|
| Logistic Regression | 0.904 | 0.094 | 0.012 | 0.786 | 0.023 |
| Random Forest | 0.942 | 0.362 | 0.203 | 0.642 | 0.308 |
| **XGBoost** | **0.940** | **0.372** | **0.106** | **0.728** | **0.185** |

### Matrice de confusion (XGBoost)
```
              Prédit 0    Prédit 1
Réel 0         98 767       1 060
Réel 1             47         126
```

### Pourquoi XGBoost a été choisi
C'est le modèle avec **la meilleure PR-AUC (0.372)**. Dans un problème déséquilibré, la PR-AUC est la métrique la plus importante car elle se concentre sur la classe minoritaire.

### Pourquoi ne pas utiliser l'accuracy ?
Avec 99.83% de non-convertis, un modèle qui prédit toujours 0 aurait 99.83% d'accuracy mais ne détecterait AUCUNE fraude. L'accuracy est donc **trompeuse** sur données déséquilibrées.

### Métriques importantes à retenir
- **PR-AUC** (Precision-Recall AUC) : métrique PRIORITAIRE
- **Recall** : capacité à trouver les vrais positifs (fraude)
- **F1-score** : harmonique entre précision et recall
- **ROC-AUC** : utile mais moins fiable sur données déséquilibrées

### Features les plus importantes (XGBoost)
1. **app_conversion_rate** (35.5%) : le taux de conversion historique de l'app est le plus important
2. **channel_conversion_rate** (24.1%) : le canal est très important
3. **ip_click_count** (4.7%) : le volume de clics par IP
4. **unique_channels_per_ip** (3.8%) : la diversité des canaux
5. **time_since_prev_click** (3.5%) : le temps entre les clics

---

## 8. Score de risque et décision

### Calcul du score de risque

```python
risk_score = 0.6 × anomaly_score + 0.4 × (1 - conversion_probability)
```

- **anomaly_score** (poids 60%) : vient de l'Isolation Forest
- **low_quality_score = 1 - conversion_probability** (poids 40%) : vient du XGBoost

### Seuils de décision

| Décision | Condition | Action | Couleur |
|----------|-----------|--------|---------|
| **allow** | risk_score < 0.40 | Clic autorisé (normal) | 🟢 Vert |
| **monitor** | 0.40 ≤ risk_score < 0.70 | Clic surveillé (moyen) | 🟠 Orange |
| **block** | risk_score ≥ 0.70 | Clic bloqué (suspect) | 🔴 Rouge |

### Interprétation
- **allow** : clic probablement légitime, forte probabilité de conversion
- **monitor** : risque modéré, nécessite une surveillance
- **block** : clic très suspect, fort risque de fraude/faible qualité

---

## 9. Analyse ROI

### Hypothèses business
Les paramètres sont définis dans `models/metadata.json` :
```json
{
  "cost_per_click": 0.05,       // 5 centimes par clic
  "revenue_per_conversion": 5.0  // 5€ de revenu par conversion
}
```

### Calcul du ROI
```
ROI = (Revenu - Coût) / Coût
Coût = Nombre de clics × Coût par clic
Revenu = Nombre de conversions × Revenu par conversion
```

### Résultats

| Scénario | Clics | Conversions | Coût | Revenu | ROI |
|----------|-------|-------------|------|--------|-----|
| Avant filtrage | 100 000 | 173 | 5 000.00€ | 865.00€ | **-82.70%** |
| Après filtrage | 86 012 | 167 | 4 300.60€ | 835.00€ | **-80.58%** |

**Les clics "block" (14 000) sont supprimés.**

### Gains

| Indicateur | Valeur |
|------------|--------|
| Économie estimée | **699.40€** |
| Amélioration du ROI | **+2.12 points** |
| Clics supprimés | **13 988** |
| Conversions perdues | **6** |

### Interprétation
En supprimant ~14% des clics les plus suspects, on ne perd que 6 conversions sur 173 (3.5%) mais on économise 700€. Le ROI passe de -82.7% à -80.6% (encore négatif car la campagne n'est pas rentable, mais moins déficitaire).

---

## 10. L'API FastAPI

### Fichier : `src/realtime_api.py`

### Principe
L'API charge les modèles pré-entraînés (XGBoost + Isolation Forest + Scaler) au démarrage, puis expose des routes REST pour scorer les clics en temps réel.

### Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Page d'accueil, vérifie que l'API tourne |
| POST | `/score-click` | Score un seul clic et le stocke en DB |
| POST | `/score-batch` | Score une liste de clics en une seule requête |
| GET | `/clicks` | Récupère l'historique des clics scorés |
| GET | `/stats` | Statistiques agrégées (total, allow/monitor/block) |

### Fonctionnement du scoring

1. **Réception** : L'API reçoit un JSON avec `ip`, `app`, `device`, `os`, `channel`, `click_time`
2. **Feature extraction** : Calcule les features temporelles et comportementales
3. **Anomaly scoring** : Applique l'Isolation Forest pour obtenir `anomaly_score`
4. **Conversion prediction** : Applique XGBoost pour obtenir `conversion_probability`
5. **Risk score** : Combine les deux avec la formule : `0.6 × anomaly_score + 0.4 × (1 - conversion_probability)`
6. **Decision** : Applique les seuils (allow/monitor/block)
7. **Stockage** : Sauvegarde dans SQLite (`click_logs.db`)
8. **Réponse** : Retourne `conversion_probability`, `risk_score`, `anomaly_score`, `anomaly_flag`, `decision`, `feature_importance`

### Exemple de requête
```json
POST /score-click
{
  "ip": 17357,
  "app": 12,
  "device": 1,
  "os": 19,
  "channel": 245,
  "click_time": "2026-07-05 14:32:21"
}
```

### Exemple de réponse
```json
{
  "conversion_probability": 0.730979,
  "risk_score": 0.392671,
  "anomaly_score": 0.475105,
  "anomaly_flag": 0,
  "decision": "allow",
  "feature_importance": [
    {"feature": "app_conversion_rate", "importance": 0.35529},
    {"feature": "channel_conversion_rate", "importance": 0.241064}
  ]
}
```

### Base de données SQLite
Fichier : `click_logs.db`
Table : `scored_clicks`
Colonnes : `id`, `ip`, `app`, `device`, `os`, `channel`, `click_time`, `conversion_probability`, `risk_score`, `decision`

---

## 11. Le Dashboard Streamlit

### Fichier : `dashboard/streamlit_dashboard.py`

### Fonctionnalités
- **Auto-refresh** toutes les 3 secondes
- **Métriques en temps réel** : nombre total de clics, score de risque moyen, probabilité moyenne de conversion
- **Distribution des décisions** : histogramme allow/monitor/block
- **Distribution du score de risque** : histogramme
- **Top 10 IP suspectes** : IP avec les scores de risque les plus élevés
- **Analyse ROI** : comparaison avant/après filtrage avec graphiques et métriques

### Technologies utilisées
- **streamlit** : framework dashboard
- **plotly** : graphiques interactifs
- **pandas** : manipulation des données
- **sqlite3** : lecture des clics scorés
- **streamlit_autorefresh** : auto-rafraîchissement

---

## 12. Le Frontend React

### Structure
```
frontend/src/
├── App.tsx              # Routes principales
├── pages/
│   ├── Accueil.tsx      # Page d'accueil
│   ├── Simulation.tsx   # Simulation de clic individuel
│   ├── SimulationBatch.tsx # Simulation batch
│   ├── Dashboard.tsx    # Dashboard stats
│   └── ROI.tsx          # Page ROI
├── services/
│   └── api.ts           # Appels à l'API FastAPI
├── components/          # Composants réutilisables
└── context/            # Contextes React (Toast, Click)
```

### Fonctionnalités
- Interface web moderne avec React + TypeScript + Tailwind CSS
- Simulation de clics normaux et suspects
- Visualisation des résultats en temps réel
- Appels à l'API FastAPI via fetch

---

## 13. Comment tout exécuter

### Prérequis
- Python 3.14
- Node.js
- Les modèles pré-entraînés dans `models/`

### Commandes

**1. API FastAPI (Terminal 1)**
```powershell
cd "chemin/du/projet"
uvicorn src.realtime_api:app --reload --port 8000
```

**2. Dashboard Streamlit (Terminal 2)**
```powershell
cd "chemin/du/projet"
streamlit run dashboard/streamlit_dashboard.py
```

**3. Frontend React (Terminal 3)**
```powershell
cd "chemin/du/projet/frontend"
npm install   # une seule fois
npm run dev
```

**4. Test simple** : Ouvrir `web/index.html` dans le navigateur

### Accès
| Service | URL |
|---------|-----|
| API FastAPI | http://127.0.0.1:8000 |
| Dashboard Streamlit | http://localhost:8501 |
| Frontend React | http://localhost:5173 |
| Page test HTML | Ouvrir web/index.html |

---

## 14. Limites du projet

### Limites méthodologiques
1. **Pas de label "fraude"** : Le dataset n'a que `is_attributed` (conversion), pas de vérité terrain sur la fraude réelle
2. **`is_attributed=0` ≠ fraude** : Un clic non converti peut être légitime (navigation, comparaison, etc.)
3. **ROI simulé** : Les coûts et revenus sont des hypothèses, pas des données réelles
4. **Échantillon limité** : 500 000 lignes sur un dataset de plusieurs millions

### Limites techniques
1. **Version sklearn** : Les modèles ont été entraînés avec sklearn 1.6.1, on utilise 1.9.0 (warnings de compatibilité)
2. **SQLite** : Base de données locale, pas adaptée à une production à grande échelle
3. **Pas d'authentification** : L'API est ouverte (CORS: *)
4. **Mono-thread** : Pas de gestion de concurrence pour l'instant

### Points à améliorer
- Utiliser le dataset complet plutôt qu'un échantillon
- Avoir de vraies données de coût/revenu
- Ajouter un système de feedback (clics signalés comme frauduleux par des humains)
- Déployer avec Docker

---

## 15. Questions potentielles du prof

### Q1 : Pourquoi KDD ?
Le projet suit les 5 étapes KDD : Business Understanding → Data Understanding → Data Preparation → Modeling → Evaluation/Deployment. C'est une méthodologie standard en data mining.

### Q2 : Pourquoi PR-AUC plutôt que ROC-AUC ?
ROC-AUC peut être trompeur sur les données déséquilibrées (99.8% de négatifs). Avec beaucoup de négatifs, le ROC peut sembler bon même si le modèle rate tous les positifs. PR-AUC se concentre sur la classe minoritaire.

### Q3 : Pourquoi Isolation Forest ?
C'est un algorithme non supervisé rapide qui ne nécessite pas de labels. Il isole les anomalies plutôt que de modéliser la normalité. Il est particulièrement adapté aux données de grande dimension.

### Q4 : Pourquoi XGBoost et pas Random Forest ?
XGBoost a la meilleure PR-AUC (0.372 contre 0.362). De plus, XGBoost est généralement plus performant sur les données tabulaires et gère mieux le déséquilibre avec `scale_pos_weight`.

### Q5 : Qu'est-ce que le feature engineering ?
C'est la création de nouvelles variables à partir des données brutes pour aider le modèle à apprendre. Ici, on a créé des variables comportementales : volume de clics, diversité, rapidité, taux de conversion historiques.

### Q6 : Comment le système prend une décision ?
Le score de risque combine : 60% anomaly_score (Isolation Forest) + 40% low_quality_score (1 - conversion_probability du XGBoost). Seuils : < 0.40 = allow, 0.40-0.70 = monitor, ≥ 0.70 = block.

### Q7 : Quelle est la différence entre allow, monitor, block ?
- **allow** : clic normal, autorisé
- **monitor** : risque moyen, surveillé mais pas bloqué
- **block** : risque élevé, clic bloqué (exclu des statistiques et du calcul ROI)

### Q8 : Comment le ROI est-il calculé ?
ROI = (Revenu - Coût) / Coût, avec Coût = clics × 0.05€ et Revenu = conversions × 5.00€. Le scénario "after_filtering" exclut les clics "block".

### Q9 : Pourquoi le ROI reste négatif ?
Le marché du CPC est très compétitif. Un taux de conversion de 0.17% avec un CPC de 0.05€ et un revenu de 5€/conversion donne naturellement un ROI négatif. Le filtrage améliore la situation mais ne la rend pas rentable.

### Q10 : Qu'est-ce que l'architecture microservices ?
Le projet utilise 3 services indépendants : API (FastAPI), Dashboard (Streamlit), Frontend (React). Chacun a son propre port et sa propre responsabilité. Ils communiquent via API REST.

### Q11 : Comment gérer le déséquilibre des classes ?
Plusieurs techniques utilisées :
- `class_weight="balanced"` (Logistic Regression)
- `class_weight="balanced_subsample"` (Random Forest)
- `scale_pos_weight` (XGBoost)
- Split stratifié
- Métriques adaptées (PR-AUC, Recall, F1)

### Q12 : Quelle est la différence entre la partie KDD et l'application ?
La partie KDD (notebook) explore, prépare et entraîne les modèles. L'application (API + Dashboard) utilise les modèles exportés pour scorer les clics en temps réel et visualiser les résultats.
