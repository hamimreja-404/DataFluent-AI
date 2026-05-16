import { useState, useMemo } from 'react';
import { List, Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

const PAGE_SIZE = 25;

export default function DataTable({ data, columns }) {
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter.trim()) return data;
    const q = filter.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    );
  }, [data, filter]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      const na = parseFloat(va), nb = parseFloat(vb);
      if (!isNaN(na) && !isNaN(nb)) return sortDir === 'asc' ? na - nb : nb - na;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(0);
  };

  return (
    <div style={styles.wrap} className="glass-card">
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <span style={styles.title}><List size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} /> Results — {filtered.length} row{filtered.length !== 1 ? 's' : ''}</span>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(0); }}
            placeholder="Filter results…"
            style={{ ...styles.filterInput, paddingLeft: 32 }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.numCol }}>#</th>
              {columns.map(col => (
                <th key={col} style={styles.th} onClick={() => toggleSort(col)}>
                  <div style={styles.thInner}>
                    {col.toUpperCase()}
                    <span style={{ marginLeft: 4, opacity: 0.5, fontSize: 10 }}>
                      {sortCol === col ? (sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />) : <ArrowUpDown size={10} />}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={columns.length + 1} style={styles.empty}>No matching records</td></tr>
            ) : paginated.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}
              >
                <td style={styles.numCell}>{page * PAGE_SIZE + i + 1}</td>
                {columns.map(col => (
                  <td key={col} style={styles.td}>
                    {formatCell(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button className="btn btn-ghost" style={{ padding: '5px 12px', display: 'flex', alignItems: 'center' }} onClick={() => setPage(0)} disabled={page === 0}><ChevronsLeft size={16} /></button>
          <button className="btn btn-ghost" style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setPage(p => p - 1)} disabled={page === 0}><ChevronLeft size={16} /> Prev</button>
          <span style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 8px' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button className="btn btn-ghost" style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next <ChevronRight size={16} /></button>
          <button className="btn btn-ghost" style={{ padding: '5px 12px', display: 'flex', alignItems: 'center' }} onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}><ChevronsRight size={16} /></button>
        </div>
      )}
    </div>
  );
}

// Column names that represent money values
const MONEY_COLS = /price|amount|salary|revenue|cost|earning|income|value|fee|tax|discount|margin/i;

function formatCell(val, col = '') {
  if (val === null || val === undefined)
    return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>null</span>;

  const s = String(val);
  const n = parseFloat(s);

  if (!isNaN(n) && MONEY_COLS.test(col)) {
    // Money column → ₹ with Indian number formatting, no decimals
    return (
      <span style={{ color: '#b5cea8', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
        ₹{Math.round(n).toLocaleString('en-IN')}
      </span>
    );
  }

  if (!isNaN(n) && s.trim() !== '') {
    // Plain numeric (IDs, quantities, counts)
    return <span style={{ color: '#9cdcfe' }}>{Number.isInteger(n) ? n.toLocaleString('en-IN') : n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>;
  }

  return s;
}

const styles = {
  wrap:        { overflow: 'hidden' },
  toolbar:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 10 },
  title:       { fontWeight: 700, fontSize: 15 },
  filterInput: { background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', width: 220, transition: 'border-color 0.2s' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { padding: '12px 16px', background: 'rgba(79,142,247,0.08)', color: 'var(--text-secondary)', textAlign: 'left', fontSize: 12, fontWeight: 700, borderBottom: '1px solid var(--border)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' },
  thInner:     { display: 'flex', alignItems: 'center' },
  numCol:      { width: 48, textAlign: 'center', cursor: 'default' },
  td:          { padding: '10px 16px', fontSize: 13.5, color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.04)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  numCell:     { padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  pagination:  { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderTop: '1px solid var(--border)', justifyContent: 'center' },
  empty:       { textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 14 },
};
