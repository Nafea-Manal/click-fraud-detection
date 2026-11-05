import pandas as pd
import streamlit as st
import plotly.express as px
from streamlit_autorefresh import st_autorefresh

st.set_page_config(
    page_title="Click Fraud Dashboard",
    layout="wide"
)

# Auto-refresh toutes les 3 secondes (pour voir les nouveaux clics en direct)
st_autorefresh(interval=3000, key="dashboard_refresh")

st.title("Dashboard — Détection de clics suspects")

ROI_PATH = "tables/roi_summary.csv"

# --- CONNEXION À POSTGRESQL (NEON) ---
# On utilise st.connection qui lit automatiquement les infos depuis secrets.toml
try:
    conn = st.connection("postgresql", type="sql")
    
    # On essaie de récupérer les données
    df = conn.query(
        "SELECT * FROM scored_clicks ORDER BY id DESC", 
        ttl="1m" # Met en cache les données pendant 10 minutes pour la performance
    )
    
except Exception as e:
    st.error(f"Erreur de connexion à la base de données : {e}")
    st.info("Vérifie que tes identifiants Neon sont corrects dans les Secrets de Streamlit.")
    df = pd.DataFrame() # DataFrame vide pour éviter un crash

# Si la base est vide (ou erreur), on affiche un message propre
if df.empty:
    st.warning("Aucun clic enregistré pour le moment. La base de données est vide.")
    # On peut quand même afficher l'analyse ROI qui vient d'un fichier CSV local
    st.subheader("Analyse ROI avant/après filtrage (Données statiques)")
    try:
        roi_df = pd.read_csv(ROI_PATH)
        st.dataframe(roi_df, use_container_width=True)
    except:
        st.info("Fichier ROI introuvable.")
    st.stop() # On arrête l'exécution ici si pas de données

# --- À PARTIR D'ICI, TON CODE ORIGINAL CONTINUE ---

st.subheader("Aperçu des données scorées")
st.dataframe(df.head(20), use_container_width=True)

col1, col2, col3 = st.columns(3)

col1.metric("Nombre total de clics", len(df))
col2.metric("Score de risque moyen", round(df["risk_score"].mean(), 3))
col3.metric(
    "Probabilité moyenne de conversion",
    round(df["conversion_probability"].mean(), 3)
)

st.subheader("Distribution des décisions")
fig_decision = px.histogram(
    df,
    x="decision",
    title="Décisions : allow / monitor / block",
    category_orders={"decision": ["allow", "monitor", "block"]}
)
st.plotly_chart(fig_decision, use_container_width=True)

st.subheader("Distribution du score de risque")
fig_risk = px.histogram(
    df,
    x="risk_score",
    nbins=50,
    title="Distribution du risk_score"
)
st.plotly_chart(fig_risk, use_container_width=True)

st.subheader("Top IP par score de risque moyen")
top_ip = (
    df.groupby("ip")["risk_score"]
    .mean()
    .sort_values(ascending=False)
    .head(10)
    .reset_index()
)

st.dataframe(top_ip, use_container_width=True)

fig_ip = px.bar(
    top_ip,
    x="ip",
    y="risk_score",
    title="Top 10 IP suspectes"
)
st.plotly_chart(fig_ip, use_container_width=True)

# --- ANALYSE ROI ---
st.subheader("Analyse ROI avant/après filtrage")

try:
    roi_df = pd.read_csv(ROI_PATH)
    st.dataframe(roi_df, use_container_width=True)

    before = roi_df[roi_df["scenario"] == "before_filtering"].iloc[0]
    after = roi_df[roi_df["scenario"] == "after_filtering"].iloc[0]

    roi_df["roi_percent"] = roi_df["roi"] * 100

    fig_roi = px.bar(
        roi_df,
        x="scenario",
        y="roi_percent",
        title="ROI avant/après filtrage (%)",
        text="roi_percent"
    )

    fig_roi.update_traces(
        texttemplate="%{text:.2f}%",
        textposition="outside"
    )

    fig_roi.update_layout(
        yaxis_title="ROI (%)",
        xaxis_title="Scénario"
    )

    st.plotly_chart(fig_roi, use_container_width=True)

    roi_improvement = (after["roi"] - before["roi"]) * 100
    cost_saving = before["cost"] - after["cost"]
    clicks_removed = before["clicks"] - after["clicks"]
    conversions_lost = before["conversions"] - after["conversions"]

    col4, col5, col6, col7 = st.columns(4)

    col4.metric("Coût avant filtrage", round(before["cost"], 2))
    col5.metric("Coût après filtrage", round(after["cost"], 2))
    col6.metric("Économie estimée", round(cost_saving, 2))
    col7.metric("Amélioration du ROI", f"{roi_improvement:.2f} points")

    col8, col9 = st.columns(2)

    col8.metric("Clics supprimés", int(clicks_removed))
    col9.metric("Conversions perdues", int(conversions_lost))
    
except Exception as e:
    st.error(f"Erreur lors de la lecture du fichier ROI : {e}")