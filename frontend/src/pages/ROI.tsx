import { useMemo } from 'react';
import { useClicks } from '../context/ClickContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, PiggyBank, ArrowUpRight } from 'lucide-react';

const COST_PER_CLICK = 0.05;
const REVENUE_PER_CONVERSION = 5.00;

export const ROI = () => {
  const { clicks } = useClicks();

  const metrics = useMemo(() => {
    const totalClicks = clicks.length;
    
    // Scénario 1: Sans filtrage (On paie pour tous les clics)
    const costBefore = totalClicks * COST_PER_CLICK;
    const expectedConversionsBefore = clicks.reduce((acc, c) => acc + c.conversion_probability, 0);
    const revenueBefore = expectedConversionsBefore * REVENUE_PER_CONVERSION;
    const roiBefore = costBefore > 0 ? ((revenueBefore - costBefore) / costBefore) * 100 : 0;

    // Scénario 2: Avec filtrage (On ne paie pas pour les 'block')
    const allowedClicks = clicks.filter(c => c.decision !== 'block');
    const costAfter = allowedClicks.length * COST_PER_CLICK;
    // On suppose que les clics bloqués n'auraient de toute façon pas converti (ou très peu)
    const expectedConversionsAfter = allowedClicks.reduce((acc, c) => acc + c.conversion_probability, 0);
    const revenueAfter = expectedConversionsAfter * REVENUE_PER_CONVERSION;
    const roiAfter = costAfter > 0 ? ((revenueAfter - costAfter) / costAfter) * 100 : 0;

    const savings = costBefore - costAfter;
    const roiImprovement = roiAfter - roiBefore;

    return {
      costBefore, costAfter, savings, roiBefore, roiAfter, roiImprovement
    };
  }, [clicks]);

  // Générer des données cumulatives pour le graphique (si on avait plus de clics on pourrait grouper par temps, ici on fait par clic séquentiel)
  const chartData = useMemo(() => {
    let accCost = 0;
    let accRev = 0;
    return clicks.map((c, index) => {
      accCost += COST_PER_CLICK;
      accRev += c.conversion_probability * REVENUE_PER_CONVERSION;
      const currentROI = accCost > 0 ? ((accRev - accCost) / accCost) * 100 : 0;
      return {
        name: `Clic ${index + 1}`,
        roi: currentROI
      };
    });
  }, [clicks]);

  if (clicks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
        <DollarSign className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-600">Aucune donnée ROI disponible</h3>
        <p className="text-gray-500 mt-2">Générez des clics depuis la Simulation pour calculer l'impact.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Impact Financier du Filtrage</h2>
        <p className="text-gray-500 text-sm">
          Hypothèses : Coût d'acquisition = {COST_PER_CLICK}$ / clic | Valeur d'une conversion = {REVENUE_PER_CONVERSION}$
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Coût sans filtrage</h3>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${metrics.costBefore.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Coût avec FraudGuard</h3>
            <ShieldAlert className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">${metrics.costAfter.toFixed(2)}</p>
        </div>

        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-emerald-800">Économies Réalisées</h3>
            <PiggyBank className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">+${metrics.savings.toFixed(2)}</p>
        </div>

        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-indigo-800">Amélioration du ROI</h3>
            <ArrowUpRight className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-indigo-600">+{metrics.roiImprovement.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-8 self-start">Comparaison du ROI</h3>
          
          <div className="flex w-full max-w-md items-end justify-around h-48 border-b border-gray-200 pb-2">
            <div className="flex flex-col items-center gap-2">
              <span className="font-bold text-gray-600">{metrics.roiBefore.toFixed(1)}%</span>
              <div 
                className="w-20 bg-gray-300 rounded-t-md transition-all duration-1000"
                style={{ height: `${Math.max(10, Math.min(100, metrics.roiBefore))}%` }}
              ></div>
              <span className="text-sm font-medium text-gray-500">Sans Filtrage</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <span className="font-bold text-blue-600">{metrics.roiAfter.toFixed(1)}%</span>
              <div 
                className="w-20 bg-blue-500 rounded-t-md transition-all duration-1000"
                style={{ height: `${Math.max(10, Math.min(100, metrics.roiAfter))}%` }}
              ></div>
              <span className="text-sm font-medium text-blue-700">Avec FraudGuard</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Évolution du ROI (Non-filtré)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="roi" stroke="#3b82f6" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

import { ShieldAlert } from 'lucide-react';
