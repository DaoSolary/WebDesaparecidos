import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';

type Summary = {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  hotspots: { province: string; _count: { _all: number } }[];
  demographics: { gender: string; _count: { _all: number } }[];
};

const COLORS = ['#2563eb', '#f97316', '#0ea5e9', '#16a34a', '#a855f7'];

export function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary>();

  useEffect(() => {
    api.get('/stats/summary').then((res) => setSummary(res.data));
  }, []);

  if (!summary) return <p>A carregar estatísticas...</p>;

  const genderData = summary.demographics.map((item) => ({ name: item.gender ?? 'Não informado', value: item._count._all }));
  const hotspotData = summary.hotspots.map((item) => ({ name: item.province, value: item._count._all }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Casos registados" value={summary.totalCases} />
        <Card label="Casos activos" value={summary.activeCases} />
        <Card label="Casos resolvidos" value={summary.resolvedCases} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Distribuição por género</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" label>
                {genderData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Zonas críticas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hotspotData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}


