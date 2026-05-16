import { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

import Header          from './components/Header';
import SchemaExplorer  from './components/SchemaExplorer';
import QueryInput      from './components/QueryInput';
import SuggestionChips from './components/SuggestionChips';
import SQLViewer       from './components/SQLViewer';
import InsightCard     from './components/InsightCard';
import StatsBar        from './components/StatsBar';
import ChartPanel      from './components/ChartPanel';
import DataTable       from './components/DataTable';
import ExportBar       from './components/ExportBar';
import QueryHistory    from './components/QueryHistory';
import PasswordModal   from './components/PasswordModal';
import DMLResultCard   from './components/DMLResultCard';
import KPIDashboard    from './components/KPIDashboard';
import { XCircle, SearchX } from 'lucide-react';

const BASE = 'http://localhost:5000';

// DDL operations that change the schema structure → trigger sidebar refresh
const SCHEMA_CHANGING_OPS = ['ALTER', 'CREATE', 'DROP', 'RENAME'];

export default function App() {
  const [query,        setQuery]        = useState('');
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);   // { message, details, sql, analysis }
  const [history,      setHistory]      = useState([]);
  const [showHistory,  setShowHistory]  = useState(false);
  const [showSchema,   setShowSchema]   = useState(true);
  const [pendingAuth,  setPendingAuth]  = useState(null);
  const [schemaKey,    setSchemaKey]    = useState(0);      // increment to refresh schema sidebar
  const chartRef = useRef(null);

  const askQuestion = async (adminPassword = null) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    if (!adminPassword) setResult(null);

    try {
      const { data } = await axios.post(`${BASE}/api/ask`, {
        question: query.trim(),
        ...(adminPassword ? { adminPassword } : {}),
      });

      if (data.requiresAuth) {
        setPendingAuth({ sql: data.sql, queryType: data.queryType });
        setLoading(false);
        return;
      }

      setResult(data);
      setPendingAuth(null);

      // Refresh schema sidebar when DDL changes table structure
      if (SCHEMA_CHANGING_OPS.includes(data.queryType)) {
        setSchemaKey(k => k + 1);
      }

      setHistory(prev => [{
        question:      query.trim(),
        sql:           data.sql,
        queryType:     data.queryType,
        total:         data.total,
        executionTime: data.executionTime,
        timestamp:     new Date(),
      }, ...prev.slice(0, 19)]);

    } catch (err) {
      const resp = err.response?.data || {};
      if (resp.requiresAuth) throw new Error(resp.error);   // bubble to PasswordModal
      setError({
        message:  resp.error   || 'Something went wrong.',
        details:  resp.details || err.message,
        sql:      resp.sql     || null,
        analysis: resp.analysis|| null,
      });
    }
    setLoading(false);
  };

  return (
    <div className="app-layout">
      <Header
        onToggleHistory={() => setShowHistory(v => !v)}
        onToggleSchema={()  => setShowSchema(v => !v)}
        historyCount={history.length}
      />

      <div className="app-body">
        <SchemaExplorer visible={showSchema} refreshKey={schemaKey} />

        <main className="main-content">
          <div className="content-stack">

            <QueryInput query={query} onChange={setQuery} onSubmit={() => askQuestion()} loading={loading} />
            <SuggestionChips onSelect={q => setQuery(q)} />

            {/* Rich error panel */}
            {error && <ErrorPanel error={error} onClose={() => setError(null)} />}

            {result?.isDML && <DMLResultCard result={result} onReset={() => setResult(null)} />}

            {result && !result.isDML && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade">
                <SQLViewer sql={result.sql} executionTime={result.executionTime} queryType={result.queryType} />
                <InsightCard insight={result.insight} />
                <StatsBar total={result.total} columnCount={result.columns.length} executionTime={result.executionTime} />
                <ChartPanel data={result.data} columns={result.columns} recommendedChart={result.recommendedChart} chartRef={chartRef} />
                <DataTable data={result.data} columns={result.columns} />
                <ExportBar data={result.data} columns={result.columns} sql={result.sql} insight={result.insight} question={result.question} />
              </div>
            )}

            {!result && !error && !loading && (
              <>
                <KPIDashboard />
                <div style={styles.empty}>
                  <SearchX size={72} color="rgba(79,142,247,0.3)" strokeWidth={1} />
                  <h2 style={styles.emptyTitle}>Ask anything about Berger Paints data</h2>
                  <p style={styles.emptySub}>
                    Type a question in plain English — AI generates SQL, runs it, and shows insights, charts and data.
                  </p>
                </div>
              </>
            )}

          </div>
        </main>
      </div>

      <QueryHistory
        history={history}
        visible={showHistory}
        onSelect={q => { setQuery(q); setShowHistory(false); }}
        onClose={() => setShowHistory(false)}
      />

      <PasswordModal
        visible={!!pendingAuth}
        sql={pendingAuth?.sql}
        queryType={pendingAuth?.queryType}
        onConfirm={async (pwd) => await askQuestion(pwd)}
        onCancel={() => setPendingAuth(null)}
      />
    </div>
  );
}

// ── Rich error panel ────────────────────────────────────────────
function ErrorPanel({ error, onClose }) {
  const [showSQL, setShowSQL] = useState(false);

  return (
    <div style={styles.errPanel} className="animate-fade">
      {/* Title row */}
      <div style={styles.errTop}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <XCircle size={20} color="var(--red)" strokeWidth={2} />
            <span style={styles.errTitle}>Query Failed</span>
          </div>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>

      {/* MySQL error details */}
      <div style={styles.errDetails}>{error.details}</div>

      {/* AI analysis */}
      {error.analysis && (
        <div style={styles.analysis}>
          {error.analysis.split('\n').map((line, i) => (
            <div key={i} style={{ marginBottom: i === 0 ? 4 : 0 }}>
              {line.startsWith('Fix:')
                ? <><span style={{ color: 'var(--green)', fontWeight: 700 }}>Fix: </span>{line.slice(5)}</>
                : <><span style={{ color: 'var(--gold)',  fontWeight: 700 }}>Reason: </span>{line.replace('Reason: ', '')}</>
              }
            </div>
          ))}
        </div>
      )}

      {/* Expandable SQL */}
      {error.sql && (
        <div>
          <button onClick={() => setShowSQL(v => !v)} style={styles.sqlToggle}>
            {showSQL ? 'Hide' : 'Show'} generated SQL
          </button>
          {showSQL && <pre style={styles.sqlBox}>{error.sql}</pre>}
        </div>
      )}
    </div>
  );
}

const styles = {
  empty:     { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' },
  emptyTitle:{ fontSize: 20, fontWeight: 700, marginBottom: 10 },
  emptySub:  { fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 460 },
  errPanel:  { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  errTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  errIcon:   { width: 22, height: 22, background: 'var(--red)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 },
  errTitle:  { fontSize: 15, fontWeight: 700, color: 'var(--red)' },
  closeBtn:  { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 },
  errDetails:{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: '#fca5a5', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 7, lineHeight: 1.5 },
  analysis:  { fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 },
  sqlToggle: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, padding: 0, textDecoration: 'underline' },
  sqlBox:    { marginTop: 8, padding: '10px 12px', background: 'rgba(0,0,0,0.4)', borderRadius: 7, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#a0c4ff', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
};