import React, { useState } from "react";
import { scoreClick, type ClickInput } from "../services/api";
import { useClicks } from "../context/ClickContext";
import { useToast } from "../context/ToastContext";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Simulation = () => {
  const { addClick } = useClicks();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ClickInput>({
    ip: 17357,
    app: 12,
    device: 1,
    os: 19,
    channel: 245,
    click_time: new Date().toISOString().slice(0, 19),
  });

  const [lastResult, setLastResult] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "click_time" ? value : Number(value),
    }));
  };

  const setAllowClick = () => {
    const randomIp = Math.floor(Math.random() * 90000) + 10000;
    setFormData({
      ip: randomIp,
      app: 18,
      device: 1,
      os: 13,
      channel: 400,
      click_time: "2026-06-10T15:30:00",
    });
  };

  const setMonitorClick = () => {
    const randomIp = Math.floor(Math.random() * 90000) + 10000;
    setFormData({
      ip: randomIp,
      app: 3,
      device: 1,
      os: 13,
      channel: 379,
      click_time: "2026-06-10T15:30:00",
    });
  };

  const setBlockClick = () => {
    setFormData({
      ip: 17357,
      app: 12,
      device: 1,
      os: 19,
      channel: 245,
      click_time: "2026-06-10T19:30:00",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const result = await scoreClick(formData);
      setLastResult(result);

      addClick({
        ...formData,
        ...result,
        id: Math.random().toString(36).substring(7),
      });

      const riskPct = (result.risk_score * 100).toFixed(1);
      if (result.decision === "allow") {
        addToast(`✅ Clic autorisé — Score de risque: ${riskPct}%`, "success");
      } else if (result.decision === "monitor") {
        addToast(
          `⚠️ Clic sous surveillance — Score de risque: ${riskPct}%`,
          "warning",
        );
      } else if (result.decision === "block") {
        addToast(
          `🚫 Clic bloqué — Fraude détectée! Score: ${riskPct}%`,
          "error",
        );
      }
    } catch (err: any) {
      setError(
        "Impossible de contacter l'API (assurez-vous que FastAPI est lancé sur le port 8000).",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderBadge = (decision: string) => {
    switch (decision) {
      case "allow":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
            <CheckCircle2 className="w-5 h-5" /> Autorisé
          </div>
        );
      case "monitor":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full font-medium">
            <AlertCircle className="w-5 h-5" /> Sous Surveillance
          </div>
        );
      case "block":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium">
            <XCircle className="w-5 h-5" /> Bloqué
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Simulation de Trafic
        </h2>

        <div className="flex flex-wrap gap-4 mb-8">
          <button
            type="button"
            onClick={setAllowClick}
            className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors font-medium text-sm border border-green-200"
          >
            Pré-remplir: Clic Autorisé (Allow)
          </button>
          <button
            type="button"
            onClick={setMonitorClick}
            className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors font-medium text-sm border border-orange-200"
          >
            Pré-remplir: Clic Surveillé (Monitor)
          </button>
          <button
            type="button"
            onClick={setBlockClick}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors font-medium text-sm border border-red-200"
          >
            Pré-remplir: Clic Bloqué (Block)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP Address
              </label>
              <input
                type="number"
                name="ip"
                value={formData.ip}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App ID
              </label>
              <input
                type="number"
                name="app"
                value={formData.app}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device ID
              </label>
              <input
                type="number"
                name="device"
                value={formData.device}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OS ID
              </label>
              <input
                type="number"
                name="os"
                value={formData.os}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel ID
              </label>
              <input
                type="number"
                name="channel"
                value={formData.channel}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Click Time
              </label>
              <input
                type="text"
                name="click_time"
                value={formData.click_time}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {loading ? "Analyse en cours..." : "Envoyer le clic à l'API"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {lastResult && (
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Résultat de l'analyse (Temps Réel)
            </h3>

            {/* 3 metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">
                  Probabilité de Conversion
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {(lastResult.conversion_probability * 100).toFixed(2)}%
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Score de Risque</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(lastResult.risk_score * 100).toFixed(2)}%
                </p>
              </div>

              <div className="flex justify-center md:justify-end">
                {renderBadge(lastResult.decision)}
              </div>
            </div>

            {/* Feature importance chart */}
            {lastResult.feature_importance &&
              lastResult.feature_importance.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    🔍 Facteurs d'Influence (Top 5)
                  </h4>
                  <div className="bg-white rounded-lg border border-gray-100 p-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart
                        layout="vertical"
                        data={lastResult.feature_importance.slice(0, 5)}
                        margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
                      >
                        <XAxis
                          type="number"
                          domain={[0, 1]}
                          tickFormatter={(v: number) =>
                            `${(v * 100).toFixed(0)}%`
                          }
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="feature"
                          width={160}
                          tick={{ fontSize: 11, fill: "#374151" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(val: any) => [
                            `${(val * 100).toFixed(2)}%`,
                            "Importance",
                          ]}
                          cursor={{ fill: "#f3f4f6" }}
                        />
                        <Bar
                          dataKey="importance"
                          fill="#3b82f6"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
