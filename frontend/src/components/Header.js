import { useEffect, useState } from 'react';
import axios from 'axios';
import { Palette, Database, History, Circle } from 'lucide-react';

const BASE = 'https://datafluent-ai.onrender.com';

export default function Header({ onToggleHistory, onToggleSchema, historyCount }) {
  const [dbStatus, setDbStatus] = useState('connecting');

  const check = () =>
    axios.get(`${BASE}/api/health`)
      .then(() => setDbStatus('connected'))
      .catch(() => setDbStatus('disconnected'));

  useEffect(() => { check(); const iv = setInterval(check, 30_000); return () => clearInterval(iv); }, []);

  const statusColor = { connected: 'var(--green)', connecting: 'var(--gold)', disconnected: 'var(--red)' }[dbStatus];

  return (
    <header style={styles.header}>
      <div style={styles.stripe} />
      <div style={styles.inner}>

        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.logoBox}>
            <Palette size={22} color="#4f8ef7" strokeWidth={1.8} />
          </div>
          <div>
            <div style={styles.name}>DataFluent AI</div>
            <div style={styles.sub}>Natural Language Database Intelligence</div>
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <div style={styles.status} title={`Database ${dbStatus}`}>
            <Circle size={8} fill={statusColor} color={statusColor} />
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{dbStatus}</span>
          </div>

          <button className="btn btn-ghost" onClick={onToggleSchema} style={styles.iconBtn}>
            <Database size={14} /> Schema
          </button>

          <button className="btn btn-ghost" onClick={onToggleHistory} style={{ ...styles.iconBtn, position: 'relative' }}>
            <History size={14} /> History
            {historyCount > 0 && <span style={styles.badge}>{historyCount}</span>}
          </button>
        </div>

      </div>
    </header>
  );
}

const styles = {
  header:   { position: 'sticky', top: 0, zIndex: 200, background: 'rgba(7,13,26,0.95)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)' },
  stripe:   { height: 3, background: 'linear-gradient(90deg,#4f8ef7,#a855f7,#f5a200,#22c55e)', backgroundSize: '200%', animation: 'shimmer 3s linear infinite' },
  inner:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px' },
  brand:    { display: 'flex', alignItems: 'center', gap: 12 },
  logoBox:  { width: 42, height: 42, borderRadius: 12, background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  name:     { fontSize: 17, fontWeight: 700 },
  sub:      { fontSize: 11, color: 'var(--text-muted)', marginTop: 1 },
  controls: { display: 'flex', alignItems: 'center', gap: 10 },
  status:   { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 99, border: '1px solid var(--border)' },
  iconBtn:  { display: 'flex', alignItems: 'center', gap: 5 },
  badge:    { position: 'absolute', top: -5, right: -5, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '1px 5px', minWidth: 16, textAlign: 'center' },
};
