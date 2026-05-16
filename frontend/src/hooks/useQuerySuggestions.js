import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const BASE        = 'http://localhost:5000';
const DEBOUNCE_MS = 500;
const MIN_CHARS   = 10;
const SPACE_CHARS = 6;

export function useQuerySuggestions(query, enabled = true) {
  const [completion,      setCompletion]      = useState('');
  const [remainingTokens, setRemainingTokens] = useState(null);
  const timer  = useRef(null);
  const latest = useRef(query);

  const clear = useCallback(() => setCompletion(''), []);

  useEffect(() => {
    latest.current = query;
    clearTimeout(timer.current);

    // If autocomplete is toggled off, clear immediately — no API call
    if (!enabled) { clear(); return; }

    const trimmed         = query.trimEnd();
    const spacebarTrigger = query.endsWith(' ') && trimmed.length >= SPACE_CHARS;
    const lengthTrigger   = trimmed.length >= MIN_CHARS;

    if (!spacebarTrigger && !lengthTrigger) { clear(); return; }

    timer.current = setTimeout(async () => {
      try {
        const { data } = await axios.post(`${BASE}/api/suggest`, {
          partial:      query,
          autocomplete: enabled,   // backend skips AI if false (double-guard)
        });

        if (latest.current !== query) return;   // discard stale response

        setCompletion(data.completion || '');
        if (data.remainingTokens != null) setRemainingTokens(data.remainingTokens);
      } catch {
        setCompletion('');
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer.current);
  }, [query, enabled, clear]);

  return { completion, clear, remainingTokens };
}
