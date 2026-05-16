import { useState, useRef, useCallback } from 'react';
import { useQuerySuggestions } from '../hooks/useQuerySuggestions';

export default function QueryInput({ query, onChange, onSubmit, loading }) {
  const [focused,         setFocused]         = useState(false);
  const [atEnd,           setAtEnd]           = useState(true);
  const [autocompleteOn,  setAutocompleteOn]  = useState(true);  // toggle
  const inputRef  = useRef(null);
  const mirrorRef = useRef(null);

  const isEnabled = focused && atEnd && autocompleteOn;
  const { completion, clear, remainingTokens } = useQuerySuggestions(isEnabled ? query : '', isEnabled);

  // Keep mirror scroll in sync with textarea scroll
  const syncScroll = () => {
    if (mirrorRef.current && inputRef.current)
      mirrorRef.current.scrollTop = inputRef.current.scrollTop;
  };

  const checkCursor = (e) => {
    const el = e.target;
    setAtEnd(el.selectionStart === el.value.length);
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    checkCursor(e);
    syncScroll();
  };

  // Accept ghost text on Tab
  const acceptCompletion = useCallback(() => {
    if (!completion) return false;
    const sep = query.endsWith(' ') ? '' : ' ';
    onChange(query + sep + completion);
    clear();
    setTimeout(() => {
      const el = inputRef.current;
      if (el) { el.selectionStart = el.selectionEnd = el.value.length; }
    }, 0);
    return true;
  }, [query, completion, onChange, clear]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!acceptCompletion()) onSubmit();   // Tab submits if no ghost
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape') {
      clear();
    }
  };

  // Ghost word to show = first word of completion (pure visual hint)
  const ghostText = atEnd && focused && completion
    ? (query.endsWith(' ') ? '' : ' ') + completion
    : '';

  return (
    <div style={styles.card} className="glass-card">
      {/* Header */}
      <div style={styles.hdr}>
        <span style={styles.label}>Ask a Question</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Autocomplete toggle */}
          <button
            onClick={() => { setAutocompleteOn(v => !v); clear(); }}
            title={autocompleteOn ? 'Autocomplete ON — click to disable' : 'Autocomplete OFF — click to enable'}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
              border: `1px solid ${autocompleteOn ? 'rgba(79,142,247,0.5)' : 'var(--border)'}`,
              background: autocompleteOn ? 'rgba(79,142,247,0.12)' : 'rgba(255,255,255,0.04)',
              color: autocompleteOn ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
              background: autocompleteOn ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'background 0.2s',
            }} />
            AI Complete
          </button>
          <span style={styles.hint}>
            <Kbd>Tab</Kbd> accept &nbsp;·&nbsp; <Kbd>Enter</Kbd> search
          </span>
        </div>
      </div>

      {/* Input wrapper — mirror + textarea stacked */}
      <div
        style={{
          ...styles.box,
          borderColor:  focused ? 'var(--accent)' : 'var(--border)',
          boxShadow:    focused ? '0 0 0 3px var(--accent-glow)' : 'none',
        }}
      >
        {/* Mirror div (behind textarea) — renders ghost text */}
        <div ref={mirrorRef} style={styles.mirror} aria-hidden>
          {/* User text as invisible — textarea renders this */}
          <span style={{ color: 'transparent', whiteSpace: 'pre-wrap' }}>{query}</span>
          {/* Ghost completion in muted color */}
          {ghostText && (
            <span style={styles.ghost}>{ghostText}</span>
          )}
        </div>

        {/* Actual textarea — transparent bg so ghost shows through */}
        <textarea
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); clear(); }}
          onClick={checkCursor}
          onScroll={syncScroll}
          placeholder='e.g. "Show total sales from East region with customer and product details"'
          rows={3}
          style={styles.textarea}
        />
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={loading || !query.trim()}
          style={{ minWidth: 130 }}
        >
          {loading ? <><Spin /> Analyzing…</> : 'Search AI'}
        </button>
        {query && (
          <button className="btn btn-ghost" onClick={() => { onChange(''); clear(); }}>
            Clear
          </button>
        )}
        {ghostText && (
          <span style={styles.tabTip}>
            Tab: <em style={{ color: 'var(--accent)' }}>{completion}</em>
          </span>
        )}
        {remainingTokens !== null && (
          <TokenGauge remaining={remainingTokens} />
        )}
      </div>
    </div>
  );
}

const Kbd = ({ children }) => <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontSize: 11, fontFamily: 'JetBrains Mono,monospace' }}>{children}</kbd>;

const Spin = () => <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', marginRight: 6 }} />;

// Groq rate-limit fuel gauge — shown after first ghost-text response
// MAX_TOKENS is the TPD limit for llama-3.1-8b-instant (generous — just for display)
const MAX_TOKENS = 500_000;
function TokenGauge({ remaining }) {
  const pct   = Math.min(Math.round((remaining / MAX_TOKENS) * 100), 100);
  const color  = pct > 40 ? 'var(--green)' : pct > 15 ? 'var(--gold)' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }} title={`${remaining.toLocaleString()} tokens remaining today`}>
      <div style={{ width: 60, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
        {(remaining / 1000).toFixed(0)}k
      </span>
    </div>
  );
}

// Typography MUST match between mirror and textarea
const FONT = { fontSize: 15, fontFamily: 'Inter, sans-serif', lineHeight: '1.6', letterSpacing: 'normal' };
const PAD  = { padding: '14px 16px' };

const styles = {
  card:     { display: 'flex', flexDirection: 'column', gap: 14, padding: '20px 24px' },
  hdr:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  label:    { fontWeight: 700, fontSize: 15 },
  hint:     { fontSize: 12, color: 'var(--text-muted)' },
  box: {
    position: 'relative',
    borderRadius: 10,
    border: '1.5px solid',
    background: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  mirror: {
    position: 'absolute', inset: 0,
    ...PAD, ...FONT,
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    overflowY: 'hidden', pointerEvents: 'none',
    color: 'transparent',            // base color transparent (textarea renders real text on top)
    zIndex: 0,
  },
  ghost: {
    color: 'rgba(148,163,184,0.45)',  // muted grey — visible but clearly dull vs user text
    fontStyle: 'italic',
  },
  textarea: {
    ...PAD, ...FONT,
    position: 'relative', zIndex: 1,
    width: '100%', resize: 'vertical',
    background: 'transparent',        // transparent → mirror ghost shows through
    color: '#f1f5f9',                 // bright user text
    border: 'none', outline: 'none',
    caretColor: 'var(--accent)',
    display: 'block',
  },
  footer:  { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  tabTip:  { fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 },
};
