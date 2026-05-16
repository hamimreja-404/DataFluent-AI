import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

const BASE = 'http://localhost:5000';
const TYPE_COLOR = {
  int: '#9cdcfe', bigint: '#9cdcfe', tinyint: '#9cdcfe',
  varchar: '#ce9178', text: '#ce9178', char: '#ce9178',
  decimal: '#b5cea8', float: '#b5cea8',
  date: '#c586c0', datetime: '#c586c0', timestamp: '#c586c0',
  enum: '#d4d4d4',
};

export default function SchemaExplorer({ visible, refreshKey }) {
  const [schema,     setSchema]     = useState(null);
  const [search,     setSearch]     = useState('');
  const [openTables, setOpenTables] = useState({});
  const [loading,    setLoading]    = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    axios.get(`${BASE}/api/schema`)
      .then(r => { setSchema(r.data.tables); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Reload whenever refreshKey changes (e.g. after ALTER / CREATE / DROP)
  useEffect(() => { load(); }, [load, refreshKey]);

  if (!visible) return null;

  const toggle = (name) => setOpenTables(p => ({ ...p, [name]: !p[name] }));

  const filtered = (schema || []).filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.columns.some(c => c.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <aside style={styles.aside} className="animate-slideL">
      {/* Header */}
      <div style={styles.hdr}>
        <span style={styles.title}>Schema</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="badge badge-green">{schema?.length ?? 0}</span>
          <button onClick={load} title="Refresh schema" style={styles.refreshBtn}><RefreshCw size={14} /></button>
        </div>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search…"
        style={styles.search}
      />

      <div style={styles.list}>
        {loading
          ? [1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 34, margin: '5px 10px', borderRadius: 7 }} />)
          : filtered.length === 0
            ? <div style={styles.empty}>No matches</div>
            : filtered.map(table => (
              <div key={table.name}>
                <div
                  style={styles.tableRow}
                  onClick={() => toggle(table.name)}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={styles.chevron}>{openTables[table.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                  <span style={styles.tableName}>{table.name}</span>
                  <span style={styles.colCount}>{table.columns.length}</span>
                </div>

                {openTables[table.name] && (
                  <div style={styles.colList}>
                    {table.columns.map(col => (
                      <div key={col.name} style={styles.colRow}>
                        <span style={styles.colName}>{col.name}</span>
                        <span style={{ ...styles.colType, color: TYPE_COLOR[col.type] || '#888' }}>{col.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
        }
      </div>
    </aside>
  );
}

const styles = {
  aside:      { width: 230, flexShrink: 0, background: 'rgba(10,16,30,0.97)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 62px)', position: 'sticky', top: 62, overflowY: 'auto' },
  hdr:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 12px 8px' },
  title:      { fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  refreshBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px', borderRadius: 4, transition: 'color 0.2s' },
  search:     { margin: '0 10px 6px', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'Inter, sans-serif' },
  list:       { flex: 1, overflowY: 'auto', paddingBottom: 16 },
  tableRow:   { display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer', borderRadius: 5, margin: '1px 5px', transition: 'background 0.15s' },
  chevron:    { fontSize: 11, color: 'var(--text-muted)', marginRight: 6, width: 10 },
  tableName:  { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 },
  colCount:   { fontSize: 10, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', borderRadius: 99, padding: '1px 6px' },
  colList:    { paddingLeft: 22, paddingBottom: 2 },
  colRow:     { display: 'flex', justifyContent: 'space-between', padding: '3px 8px', borderRadius: 3 },
  colName:    { fontSize: 12, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" },
  colType:    { fontSize: 11, fontFamily: "'JetBrains Mono', monospace" },
  empty:      { padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 },
};
