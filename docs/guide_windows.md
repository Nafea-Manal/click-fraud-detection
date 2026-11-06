# Guide d'installation et d'exécution (Windows PowerShell)

---

## Étape 1 : Recréer l'environnement virtuel

Ouvrir **PowerShell** à la racine du projet et exécuter :

```powershell
# 1. Supprimer l'ancien environnement virtuel
Remove-Item -Recurse -Force .venv

# 2. Créer un nouvel environnement virtuel
python -m venv .venv

# 3. Activer l'environnement virtuel
.venv\Scripts\Activate.ps1

# 4. Mettre à jour pip et installer les dépendances
python -m pip install --upgrade pip
pip install -r requirements.txt

# 5. Installer le module additionnel requis par le Dashboard
pip install streamlit-autorefresh
```

> ⚠️ Si une erreur d'exécution de script apparaît, exécutez d'abord : `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

---

## Étape 2 : Lancer l'API FastAPI (Backend)

Dans un **1er terminal PowerShell** (avec l'environnement activé) :

```powershell
.venv\Scripts\Activate.ps1
uvicorn src.realtime_api:app --reload --port 8000
```

L'API sera disponible sur : http://127.0.0.1:8000

---

## Étape 3 : Lancer le Dashboard Streamlit

Dans un **2ème terminal PowerShell** (avec l'environnement activé) :

```powershell
.venv\Scripts\Activate.ps1
streamlit run dashboard/streamlit_dashboard.py
```

Le dashboard s'ouvrira automatiquement sur : http://localhost:8501

---

## Étape 4 : Lancer le Frontend (Vite + React)

Dans un **3ème terminal PowerShell** :

```powershell
cd frontend
npm install
npm run dev
```

L'application React sera accessible sur : http://localhost:5173

---

## Étape 5 (optionnelle) : Page HTML de test

Ouvrir le fichier `web/index.html` dans le navigateur OU lancer un serveur :

```powershell
python -m http.server 8080 -d web
```

Puis ouvrir : http://localhost:8080
