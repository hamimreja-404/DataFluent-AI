import { BrainCircuit } from 'lucide-react';

export default function InsightCard({ insight }) {
  if (!insight) return null;
  return (
    <div style={styles.wrap} className="glass-card animate-fade">
      <BrainCircuit size={28} color="var(--accent)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
      <div>
        <div style={styles.label}>AI Business Insight</div>
        <div style={styles.text}>{insight}</div>
      </div>
    </div>
  );
}

const styles = {
  wrap:  { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderLeft: '3px solid var(--accent)', background: 'linear-gradient(135deg,rgba(79,142,247,0.06),rgba(168,85,247,0.04))' },
  label: { fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 },
  text:  { fontSize: 14.5, color: 'var(--text-primary)', lineHeight: 1.6 },
};
