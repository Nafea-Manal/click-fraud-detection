import { useMemo } from 'react';
import { useClicks } from '../context/ClickContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MousePointerClick, ShieldAlert, CheckCircle, Activity } from 'lucide-react';

const COLORS = {
  allow: '#10b981', // green
  monitor: '#f59e0b', // orange
  block: '#ef4444' // red
};

export const Dashboard = () => {
  const { clicks } = useClicks();

  const stats = useMemo(() => {
    const total = clicks.length;
    if (total === 0) return null;

    const allowCount = clicks.filter(c => c.decision === 'allow').length;
    const monitorCount = clicks.filter(c => c.decision === 'monitor').length;
    const blockCount = clicks.filter(c => c.decision === 'block').length;

    const avgRisk = clicks.reduce((acc, c) => acc + c.risk_score, 0) / total;
    const avgConv = clicks.reduce((acc, c) => acc + c.conversion_probability, 0) / total;

    return { total, allowCount, monitorCount, blockCount, avgRisk, avgConv };
  }, [clicks]);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Allow', value: stats.allowCount, color: COLORS.allow },
      { name: 'Monitor', value: stats.monitorCount, color: COLORS.monitor },
      { name: 'Block', value: stats.blockCount, color: COLORS.block },
    ];
  }, [stats]);

  const riskDistribution = useMemo(() => {
    const bins = [
      { name: '0-20%', count: 0 },
      { name: '20-40%', count: 0 },
      { name: '40-60%', count: 0 },
      { name: '60-80%', count: 0 },
      { name: '80-100%', count: 0 },
    ];

    clicks.forEach(c => {
      if (c.risk_score < 0.2) bins[0].count++;
      else if (c.risk_score < 0.4) bins[1].count++;
      else if (c.risk_score < 0.6) bins[2].count++;
      else if (c.risk_score < 0.8) bins[3].count++;
      else bins[4].count++;
    });

    return bins;
  }, [clicks]);

  if (clicks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
        <Activity className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-600">Aucune donnée pour la session</h3>
        <p className="text-gray-500 mt-2">Simulez des clics pour voir le dashboard s'animer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Clics</h3>
            <MousePointerClick className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.total}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Bloqués (Frauduleux)</h3>
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">{stats?.blockCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Score de Risque Moyen</h3>
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {((stats?.avgRisk || 0) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Prob. Conversion Moyenne</h3>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {((stats?.avgConv || 0) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Répartition des Décisions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Distribution du Risque</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Historique des Clics (Session)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Heure</th>
                <th className="px-6 py-3">IP</th>
                <th className="px-6 py-3">App</th>
                <th className="px-6 py-3">Device / OS</th>
                <th className="px-6 py-3">Risk Score</th>
                <th className="px-6 py-3">Décision</th>
              </tr>
            </thead>
            <tbody>
              {clicks.map((click) => (
                <tr key={click.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(click.click_time).toLocaleTimeString()}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{click.ip}</td>
                  <td className="px-6 py-4">{click.app}</td>
                  <td className="px-6 py-4">{click.device} / {click.os}</td>
                  <td className="px-6 py-4 font-semibold">{(click.risk_score * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      click.decision === 'allow' ? 'bg-green-100 text-green-800' :
                      click.decision === 'monitor' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {click.decision.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
