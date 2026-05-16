import { useState } from 'react';
import { Copy, Check, Zap, AlertTriangle } from 'lucide-react';

const SQL_EXPLANATIONS = {
  'SELECT': 'Specifies which columns to retrieve from the database.',
  'FROM': 'Specifies the table(s) to query data from.',
  'WHERE': 'Filters rows based on a condition before grouping.',
  'AND': 'Combines two conditions — both must be true.',
  'OR': 'Combines two conditions — at least one must be true.',
  'NOT': 'Negates a condition.',
  'JOIN': 'Combines rows from two or more tables.',
  'INNER JOIN': 'Returns only rows with matching values in both tables.',
  'LEFT JOIN': 'Returns all left-table rows, and matching right-table rows.',
  'RIGHT JOIN': 'Returns all right-table rows, and matching left-table rows.',
  'ON': 'Specifies the join condition between tables.',
  'GROUP BY': 'Groups rows for use with aggregate functions.',
  'ORDER BY': 'Sorts the result set ASC or DESC.',
  'HAVING': 'Filters groups after GROUP BY — like WHERE for aggregates.',
  'LIMIT': 'Restricts the number of rows returned.',
  'DISTINCT': 'Removes duplicate rows from the result.',
  'AS': 'Creates an alias for a column or table.',
  'COUNT': 'Counts the number of non-null rows.',
  'SUM': 'Calculates the total sum of a numeric column.',
  'AVG': 'Calculates the average value of a numeric column.',
  'MAX': 'Returns the highest value in the column.',
  'MIN': 'Returns the lowest value in the column.',
  'IN': 'Checks if a value matches any value in a list.',
  'LIKE': 'Searches for a pattern using % wildcard.',
  'BETWEEN': 'Filters values within a given range (inclusive).',
  'IS NULL': 'Checks if a value is NULL (missing).',
  'IS NOT NULL': 'Checks that the value is not NULL.',
  'UNION': 'Combines result sets of two SELECTs (removes duplicates).',
  'CASE': 'Conditional logic — like if/else in SQL.',
  'WHEN': 'A condition inside a CASE expression.',
  'THEN': 'The result returned when CASE WHEN is true.',
  'ELSE': 'Default result in a CASE if no condition matches.',
  'END': 'Closes a CASE expression.',
  'DROP': 'Permanently deletes the entire table.',
  'DELETE': 'Deletes rows — can be rolled back in a transaction.',
  'TRUNCATE': 'Removes all rows — faster than DELETE.',
  'ALTER': 'Modifies the structure of an existing table.',
  'UPDATE': 'Modifies existing records in a table.',
  'INSERT': 'Adds new rows of data into a table.',
  'CREATE': 'Creates a new table, view, or database object.',
};

const KEYWORDS_ORDERED = [
  'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'IS NOT NULL', 'IS NULL', 'GROUP BY', 'ORDER BY',
  ...Object.keys(SQL_EXPLANATIONS).filter(k =>
    !['INNER JOIN','LEFT JOIN','RIGHT JOIN','IS NOT NULL','IS NULL','GROUP BY','ORDER BY'].includes(k)
  ),
];

function tokenizeSql(sql) {
  const tokens = [];
  let remaining = sql;
  while (remaining.length > 0) {
    let matched = false;
    for (const kw of KEYWORDS_ORDERED) {
      const re = new RegExp(`^(${kw})(?=[\\s,()*])`, 'i');
      const m = remaining.match(re);
      if (m) {
        tokens.push({ text: m[0], isKeyword: true, explain: SQL_EXPLANATIONS[kw.toUpperCase()] });
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      const nextKwPos = KEYWORDS_ORDERED.reduce((pos, kw) => {
        const idx = remaining.search(new RegExp(`\\b${kw}\\b`, 'i'));
        return (idx > 0 && idx < pos) ? idx : pos;
      }, remaining.length);
      const plain = remaining.slice(0, Math.max(nextKwPos, 1));
      tokens.push({ text: plain, isKeyword: false });
      remaining = remaining.slice(plain.length);
    }
  }
  return tokens;
}

export default function SQLViewer({ sql, executionTime, queryType }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokens = tokenizeSql(sql);
  const isDestructive = ['DROP','DELETE','TRUNCATE','ALTER','UPDATE'].includes(queryType);

  return (
    <div style={{ ...styles.wrap, borderColor: isDestructive ? 'rgba(239,68,68,0.4)' : 'var(--border)' }} className="glass-card">
      <div style={styles.header}>
        <div style={styles.left}>
          <span style={styles.dot} /><span style={styles.dot} /><span style={styles.dot} />
          <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>Generated SQL</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {executionTime && (
            <span className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={11} /> {executionTime}ms
            </span>
          )}
          <span className={`badge badge-${isDestructive ? 'red' : 'green'}`}>{queryType}</span>
          <button onClick={copy} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            {copied ? <><Check size={13} color="var(--green)" /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
      </div>

      <pre style={styles.code}>
        {tokens.map((tok, i) =>
          tok.isKeyword ? (
            <span key={i} className="sql-keyword">
              {tok.text}
              <span className="tooltip-box">{tok.explain}</span>
            </span>
          ) : (
            <span key={i} style={{ color: getTokenColor(tok.text) }}>{tok.text}</span>
          )
        )}
      </pre>

      {isDestructive && (
        <div style={styles.warning}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>This is a <strong>{queryType}</strong> operation — protected by admin password.</span>
        </div>
      )}
    </div>
  );
}

function getTokenColor(text) {
  if (/^'[^']*'$/.test(text.trim()) || /^"[^"]*"$/.test(text.trim())) return '#ce9178';
  if (/^\d+(\.\d+)?$/.test(text.trim())) return '#b5cea8';
  if (/^--/.test(text.trim())) return '#6a9955';
  return '#d4d4d4';
}

const styles = {
  wrap:    { overflow: 'hidden', border: '1px solid' },
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid var(--border)' },
  left:    { display: 'flex', alignItems: 'center', gap: 6 },
  dot:     { width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'inline-block' },
  code:    { padding: '18px 20px', margin: 0, fontSize: 13.5, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(0,0,0,0.4)' },
  warning: { padding: '10px 16px', background: 'rgba(239,68,68,0.08)', borderTop: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 8 },
};
