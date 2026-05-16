import { useState, useRef } from 'react';
import { ChartColumn, ChartLine, ChartPie, ChartArea, Bot } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const CHART_TYPES = [
  { key: 'bar',  label: 'Bar',  Icon: ChartColumn },
  { key: 'line', label: 'Line', Icon: ChartLine },
  { key: 'pie',  label: 'Pie',  Icon: ChartPie },
  { key: 'area', label: 'Area', Icon: ChartArea },
];

const PIE_COLORS = ['#4f8ef7','#a855f7','#f5a200','#22c55e','#ef4444','#38bdf8','#fb923c','#f472b6'];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0d1526', border: '1px solid rgba(79,142,247,0.35)', borderRadius: 10, color: '#f1f5f9' },
  itemStyle: { color: '#94a3b8' },
  labelStyle: { color: '#f1f5f9', fontWeight: 600 },
};

export default function ChartPanel({ data, columns, recommendedChart, chartRef }) {
  const isChartable = data.length > 0 && columns.length >= 2 &&
    data.every(r => !isNaN(parseFloat(Object.values(r)[1])));

  const [activeType, setActiveType] = useState(recommendedChart || 'bar');

  if (!isChartable) return null;

  const chartData = data.slice(0, 50).map(row => ({
    name: String(Object.values(row)[0]).slice(0, 20),
    value: parseFloat(Object.values(row)[1]),
  }));

  return (
    <div style={styles.wrap} className="glass-card" ref={chartRef}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ ...styles.title, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ChartColumn size={16} /> Chart View
          </span>
          {recommendedChart && (
            <span style={{ ...styles.aiRec, display: 'inline-flex', alignItems: 'center', gap: 4 }} className="badge badge-purple">
              <Bot size={13} /> AI recommends: {recommendedChart}
            </span>
          )}
        </div>
        <div style={styles.tabs}>
          {CHART_TYPES.map(ct => (
            <button
              key={ct.key}
              onClick={() => setActiveType(ct.key)}
              style={{
                ...styles.tab,
                display: 'flex', alignItems: 'center', gap: 5,
                background: activeType === ct.key ? 'rgba(79,142,247,0.15)' : 'transparent',
                color: activeType === ct.key ? 'var(--accent)' : 'var(--text-muted)',
                borderColor: activeType === ct.key ? 'rgba(79,142,247,0.5)' : 'var(--border)',
              }}
            >
              <ct.Icon size={14} />
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '0 16px 20px' }}>
        <ResponsiveContainer width="100%" height={300}>
          {activeType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f8ef7" />
                  <stop offset="100%" stopColor="#2d6de0" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : activeType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="value" stroke="#4f8ef7" strokeWidth={2.5} dot={{ fill: '#4f8ef7', r: 4 }} activeDot={{ r: 7 }} />
            </LineChart>
          ) : activeType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="value" stroke="#4f8ef7" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          ) : (
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#64748b' }}>
                {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles = {
  wrap:   {},
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '16px 20px', borderBottom: '1px solid var(--border)' },
  title:  { fontWeight: 700, fontSize: 15, marginRight: 10 },
  aiRec:  { marginLeft: 8 },
  tabs:   { display: 'flex', gap: 6 },
  tab:    { padding: '5px 12px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' },
};
