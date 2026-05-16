import { CheckCircle2, Clock, Hash } from 'lucide-react';

const LABEL = {
  INSERT:   { title: 'Row Inserted',    color: 'var(--green)',  border: 'rgba(34,197,94,0.3)' },
  UPDATE:   { title: 'Rows Updated',    color: '#38bdf8',       border: 'rgba(56,189,248,0.3)' },
  DELETE:   { title: 'Rows Deleted',    color: 'var(--gold)',   border: 'rgba(245,162,0,0.3)' },
  DROP:     { title: 'Table Dropped',   color: 'var(--red)',    border: 'rgba(239,68,68,0.3)' },
  TRUNCATE: { title: 'Table Truncated', color: 'var(--red)',    border: 'rgba(239,68,68,0.3)' },
  ALTER:    { title: 'Table Altered',   color: 'var(--accent)', border: 'rgba(79,142,247,0.3)' },
  CREATE:   { title: 'Table Created',   color: 'var(--green)',  border: 'rgba(34,197,94,0.3)' },
};

export default function DMLResultCard({ result, onReset }) {
  const meta     = LABEL[result.queryType] || { title: 'Done', color: 'var(--accent)', border: 'rgba(79,142,247,0.3)' };
  const showRows = result.affectedRows !== null && result.affectedRows !== undefined;

  return (
    <div style={{ ...styles.card, borderColor: meta.border }} className="glass-card animate-fade">
      <CheckCircle2 size={64} color={meta.color} strokeWidth={1.2} />

      <div style={{ textAlign: 'center' }}>
        <div style={{ ...styles.title, color: meta.color }}>{meta.title}</div>
        {showRows && (
          <div style={styles.rows}>
            <span style={{ color: meta.color, fontWeight: 800, fontSize: 28 }}>{result.affectedRows}</span>
            <span style={styles.rowsLabel}>row{result.affectedRows !== 1 ? 's' : ''} affected</span>
          </div>
        )}
        {result.insertId > 0 && (
          <div style={styles.insertId}>
            <Hash size={13} style={{ display: 'inline', marginRight: 3 }} />
            New row ID: <strong style={{ color: meta.color }}>{result.insertId}</strong>
          </div>
        )}
      </div>

      <div style={styles.sqlBox}>
        <span style={styles.sqlLabel}>Executed SQL</span>
        <pre style={styles.sql}>{result.sql}</pre>
      </div>

      <div style={styles.timing}>
        <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
        Completed in {result.executionTime}ms
      </div>

      <button className="btn btn-ghost" onClick={onReset}>Ask another question</button>
    </div>
  );
}

const styles = {
  card:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '40px 32px', border: '1px solid' },
  title:     { fontSize: 22, fontWeight: 800, marginBottom: 8 },
  rows:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  rowsLabel: { fontSize: 14, color: 'var(--text-muted)' },
  insertId:  { marginTop: 8, fontSize: 14, color: 'var(--text-secondary)' },
  sqlBox:    { width: '100%', background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: '14px 18px' },
  sqlLabel:  { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  sql:       { margin: 0, fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace", color: '#a0c4ff', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  timing:    { fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
};
