/**
 * Building data hooks
 *
 * Each hook tries the live API first. On any failure it falls back to the
 * bundled mock data and exposes `error` so callers know why.
 */
import { useEffect, useState } from 'react';
import { apiClient } from '../utils/api';
import mockBuildingsData from '../data/mockBuildings.json';

// mockBuildings.json is either a plain array or { buildings: [] }
const MOCK = Array.isArray(mockBuildingsData)
  ? mockBuildingsData
  : (mockBuildingsData.buildings ?? []);

// ---------------------------------------------------------------------------
// useBuildings — general filtered list (maps to GET /buildings)
// ---------------------------------------------------------------------------

/**
 * @param {{ state?: string, limit?: number, minScore?: number }} [opts]
 * @returns {{ buildings: any[], loading: boolean, error: string|null }}
 */
export function useBuildings({ state = '', limit = 500, minScore } = {}) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const params = {};
        if (state) params.state = state;
        if (limit) params.limit = limit;
        if (minScore != null) params.min_score = minScore;

        const res = await apiClient.buildings(params);
        if (!cancelled) setBuildings(res.buildings ?? []);
      } catch (err) {
        if (!cancelled) {
          let all = MOCK;
          if (state) all = all.filter(b => b.state?.toLowerCase() === state.toLowerCase());
          if (minScore != null) all = all.filter(b => Number(b.final_viability_score || 0) >= minScore);
          setBuildings(all.slice(0, limit));
          setError(err.message || 'Using demo data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, limit, minScore]);

  return { buildings, loading, error };
}

// ---------------------------------------------------------------------------
// useTopBuildings — top N by viability (maps to GET /buildings/top)
// ---------------------------------------------------------------------------

/**
 * @param {number} [limit=50]
 * @returns {{ buildings: any[], loading: boolean, error: string|null }}
 */
export function useTopBuildings(limit = 50) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const res = await apiClient.topBuildings(limit);
        if (!cancelled) setBuildings(res.buildings ?? []);
      } catch (err) {
        if (!cancelled) {
          setBuildings(MOCK.slice(0, limit));
          setError(err.message || 'Using demo data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [limit]);

  return { buildings, loading, error };
}

// ---------------------------------------------------------------------------
// useTopBuildingsByState — top N for a state (maps to GET /buildings/top-by-state)
// ---------------------------------------------------------------------------

/**
 * @param {string} state
 * @param {number} [limit=25]
 * @returns {{ buildings: any[], loading: boolean, error: string|null }}
 */
export function useTopBuildingsByState(state, limit = 25) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!state) {
      setBuildings([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const res = await apiClient.topBuildingsByState(state, limit);
        if (!cancelled) setBuildings(res.buildings ?? []);
      } catch (err) {
        if (!cancelled) {
          const filtered = MOCK
            .filter(b => b.state?.toLowerCase() === state.toLowerCase())
            .slice(0, limit);
          setBuildings(filtered);
          setError(err.message || 'Using demo data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [state, limit]);

  return { buildings, loading, error };
}

// ---------------------------------------------------------------------------
// useBuildingDetail — single record (maps to GET /buildings/:id)
// ---------------------------------------------------------------------------

/**
 * @param {string|undefined} id
 * @returns {{ building: any|null, loading: boolean, error: string|null }}
 */
export function useBuildingDetail(id) {
  const [building, setBuilding] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const data = await apiClient.buildingDetail(id);
        if (!cancelled) setBuilding(data);
      } catch (err) {
        if (!cancelled) {
          setBuilding(MOCK.find(b => b.id === id) ?? null);
          setError(err.message || 'Using demo data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  return { building, loading, error };
}
