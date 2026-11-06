export interface ClickInput {
  ip: number;
  app: number;
  device: number;
  os: number;
  channel: number;
  click_time: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ScoreResponse {
  conversion_probability: number;
  risk_score: number;
  decision: "allow" | "monitor" | "block";
  feature_importance?: FeatureImportance[];
}

export interface StatsResponse {
  total: number;
  allow_count: number;
  monitor_count: number;
  block_count: number;
  fraud_rate: number;
  avg_risk_score: number;
  avg_conversion_probability: number;
}

export interface BatchResponse {
  results: ScoreResponse[];
  total: number;
}

const API_BASE_URL = "http://127.0.0.1:8000";

export const scoreClick = async (
  clickData: ClickInput,
): Promise<ScoreResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/score-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clickData),
    });
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API:", error);
    throw error;
  }
};

export const fetchClicks = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/clicks?limit=500`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des clics:", error);
    throw error;
  }
};

export const fetchStats = async (): Promise<StatsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw error;
  }
};

export const scoreBatch = async (
  clicks: ClickInput[],
): Promise<BatchResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/score-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clicks),
    });
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du score batch:", error);
    throw error;
  }
};
