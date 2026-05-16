import { useEffect, useRef, useState } from 'react';
import { BarChart2, Columns, Zap } from 'lucide-react';

export default function StatsBar({ total, columnCount, executionTime }) {
  const stats = [
    { label: 'Records Found', value: total,         Icon: BarChart2, color: 'var(--accent)', suffix: '' },
    { label: 'Columns',       value: columnCount,   Icon: Columns,   color: 'var(--purple)', suffix: '' },
    { label: 'Exec Time',     value: executionTime, Icon: Zap,       color: 'var(--gold)',   suffix: 'ms' },
  ];
  return (
    <div style={styles.grid}>
      {stats.map(s => <StatCard key={s.label} {...s} />)}
    </div>
  );
}

function StatCard({ label, value, Icon, color, suffix }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    const start  = Date.now();
    const tick   = () => {
      const t = Math.min((Date.now() - start) / 700, 1);
      setDisplay(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <div style={{ ...styles.card, borderTop: `3px solid ${color}` }} className="glass-card">
      <Icon size={22} color={color} strokeWidth={1.8} />
      <div style={{ ...styles.value, color }}>{display}{suffix}</div>
      <div style={styles.label}>{label}</div>
    </div>
  );
}

const styles = {
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 },
  card:  { padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6, borderRadius: 'var(--radius-md)' },
  value: { fontSize: 28, fontWeight: 800, lineHeight: 1 },
  label: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 },
};
