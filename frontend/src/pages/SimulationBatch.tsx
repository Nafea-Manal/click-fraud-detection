import { useState } from "react";
import {
  scoreBatch,
  type ClickInput,
  type ScoreResponse,
} from "../services/api";
import { useClicks, type ScoredClick } from "../context/ClickContext";
import { useToast } from "../context/ToastContext";
import {
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const FRAUD_APPS = [3, 18, 30, 32];
const FRAUD_OS = [13, 17, 25];
const FRAUD_CHANNELS = [379, 400, 210];
const NORMAL_APPS = [12, 15, 20, 8];
const NORMAL_DEVICES = [1, 2, 3];
const NORMAL_CHANNELS = [245, 280, 134];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateClicks = (n: number, fraudRatePercent: number): ClickInput[] => {
  return Array.from({ length: n }, () => {
    const isFraud = Math.random() * 100 < fraudRatePercent;
    if (isFraud) {
      return {
        ip: randInt(50000, 200000),
        app: randomFrom(FRAUD_APPS),
        device: 1,
        os: randomFrom(FRAUD_OS),
        channel: randomFrom(FRAUD_CHANNELS),
        click_time: new Date().toISOString().slice(0, 19),
      };
    } else {
      return {
        ip: randInt(10000, 50000),
        app: randomFrom(NORMAL_APPS),
        device: randomFrom(NORMAL_DEVICES),
        os: 19,
        channel: randomFrom(NORMAL_CHANNELS),
        click_time: new Date().toISOString().slice(0, 19),
      };
    }
  });
};

const PIE_COLORS: Record<string, string> = {
  Autorisé: "#22c55e",
  Surveillé: "#f97316",
  Bloqué: "#ef4444",
};

export const SimulationBatch = () => {
  const { addClicks } = useClicks();
  const { addToast } = useToast();

  const [numClicks, setNumClicks] = useState(100);
  const [fraudRate, setFraudRate] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [batchResults, setBatchResults] = useState<ScoreResponse[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    setError(null);
    setBatchResults(null);

    try {
      const clicks = generateClicks(numClicks, fraudRate);
      const response = await scoreBatch(clicks);

      setBatchResults(response.results);

      const scoredClicks: ScoredClick[] = clicks.map((click, i) => ({
        ...click,
        ...response.results[i],
        id: Math.random().toString(36).substring(7),
      }));
      addClicks(scoredClicks);

      const blockCount = response.results.filter(
        (r) => r.decision === "block",
      ).length;
      const monitorCount = response.results.filter(
        (r) => r.decision === "monitor",
      ).length;
      addToast(
        `🤖 Batch terminé — ${response.total} clics analysés · ${blockCount} bloqués · ${monitorCount} surveillés`,
        "info",
      );
    } catch {
      setError(
        "Impossible de contacter l'API (assurez-vous que FastAPI est lancé sur le port 8000).",
      );
    } finally {
      setIsRunning(false);
    }
  };

  // Derived stats
  const allowCount = batchResults
    ? batchResults.filter((r) => r.decision === "allow").length
    : 0;
  const monitorCount = batchResults
    ? batchResults.filter((r) => r.decision === "monitor").length
    : 0;
  const blockCount = batchResults
    ? batchResults.filter((r) => r.decision === "block").length
    : 0;
  const total = batchResults ? batchResults.length : 0;
  const detectedFraudPct =
    total > 0 ? parseFloat(((blockCount / total) * 100).toFixed(1)) : 0;

  const pieData = [
    { name: "Autorisé", value: allowCount },
    { name: "Surveillé", value: monitorCount },
    { name: "Bloqué", value: blockCount },
  ].filter((d) => d.value > 0);

  const compData = [
    { label: "Fraude Injectée", value: fraudRate, fill: "#f97316" },
    { label: "Fraude Détectée", value: detectedFraudPct, fill: "#ef4444" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Simulation en Masse
          </h2>
        </div>
        <p className="text-gray-500 mb-8">
          Générez automatiquement N clics avec un taux de fraude configurable et
          analysez-les en batch.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Slider: numClicks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Nombre de clics
              </label>
              <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                {numClicks}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={numClicks}
              onChange={(e) => setNumClicks(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10</span>
              <span>500</span>
            </div>
          </div>

          {/* Slider: fraudRate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Taux de fraude simulé
              </label>
              <span className="text-sm font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-full">
                {fraudRate}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={fraudRate}
              onChange={(e) => setFraudRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isRunning}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-lg font-medium transition-colors"
          >
            {isRunning ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
            {isRunning ? "Analyse en cours..." : "Lancer la Simulation"}
          </button>
        </form>
      </div>

      {/* Loading state */}
      {isRunning && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="font-medium text-gray-700">
                Analyse en cours
                <span className="inline-flex gap-1 ml-2">
                  <span
                    className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </span>
              </span>
            </div>
            <span className="text-sm text-gray-500 font-medium">
              {numClicks} clics
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <XCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {batchResults && !isRunning && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Total Analysés
              </p>
              <p className="text-3xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-400 mt-1">clics traités</p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                Autorisés
              </p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-green-700">
                  {allowCount}
                </p>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {total > 0 ? ((allowCount / total) * 100).toFixed(1) : 0}% du
                total
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-orange-100">
              <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">
                Surveillés
              </p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-orange-700">
                  {monitorCount}
                </p>
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {total > 0 ? ((monitorCount / total) * 100).toFixed(1) : 0}% du
                total
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100">
              <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">
                Bloqués
              </p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-red-700">{blockCount}</p>
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {total > 0 ? ((blockCount / total) * 100).toFixed(1) : 0}% du
                total
              </p>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PieChart: Decision Breakdown */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Répartition des Décisions
              </h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[entry.name] ?? "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${value} (${total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0}%)`,
                        name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-55 text-gray-400 text-sm">
                  Aucune donnée disponible
                </div>
              )}
            </div>

            {/* BarChart: Injected vs Detected Fraud */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                Fraude Injectée vs Détectée
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Comparaison en pourcentage du total
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={compData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      `${Number(value).toFixed(1)}%`,
                      "Taux",
                    ]}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {compData.map((entry) => (
                      <Cell key={entry.label} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detection rate note */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Analyse de Performance
                </h4>
                <p className="text-sm text-gray-500 mb-3">
                  Sur <strong>{total}</strong> clics générés avec un taux de
                  fraude injecté de{" "}
                  <strong className="text-orange-600">{fraudRate}%</strong>, le
                  modèle a détecté et bloqué{" "}
                  <strong className="text-red-600">{detectedFraudPct}%</strong>{" "}
                  des clics.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-xs text-gray-500">
                      Taux de détection
                    </span>
                    <span className="text-sm font-bold text-blue-700">
                      {fraudRate > 0
                        ? Math.min(
                            100,
                            ((detectedFraudPct / fraudRate) * 100).toFixed(1) +
                              "" !==
                              "NaN"
                              ? parseFloat(
                                  (
                                    (detectedFraudPct / fraudRate) *
                                    100
                                  ).toFixed(1),
                                )
                              : 0,
                          )
                        : "N/A"}
                      {fraudRate > 0 ? "%" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-xs text-gray-500">
                      Clics légitimes
                    </span>
                    <span className="text-sm font-bold text-green-700">
                      {total > 0 ? ((allowCount / total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-xs text-gray-500">
                      Sous surveillance
                    </span>
                    <span className="text-sm font-bold text-orange-700">
                      {total > 0
                        ? ((monitorCount / total) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
