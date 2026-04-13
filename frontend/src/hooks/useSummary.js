/**
 * Summary and state hooks
 *
 * useSummary — dashboard-level stats (GET /summary)
 * useStates  — per-state summaries    (GET /states)
 */
import { useEffect, useState } from 'react';
import { apiClient } from '../utils/api';
import mockSummaryData from '../data/mockSummary.json';

// ---------------------------------------------------------------------------
// useSummary
// ---------------------------------------------------------------------------

/**
 * @returns {{ summary: import('../utils/api').Summary|null, loading: boolean, error: string|null }}
 */
export function useSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const data = await apiClient.summary();
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) {
          setSummary(mockSummaryData);
          setError(err.message || 'Using demo data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { summary, loading, error };
}

// ---------------------------------------------------------------------------
// useStates
// ---------------------------------------------------------------------------

/**
 * @returns {{ states: import('../utils/api').StateSummary[], loading: boolean, error: string|null }}
 */
export function useStates() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const res = await apiClient.states();
        if (!cancelled) setStates((res.states ?? []).map((s) => (typeof s === 'string' ? s : s.state)));
      } catch (err) {
        if (!cancelled) {
          setStates((mockSummaryData.state_summaries ?? []).map((s) => (typeof s === 'string' ? s : s.state)));
          setError(err.message || 'Using demo data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { states, loading, error };
}
