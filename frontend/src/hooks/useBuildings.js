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
export function useBuildings({ state = '', limit = 1000, minScore } = {}) {
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
export function useTopBuildings(limit = 1000) {
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
export function useTopBuildingsByState(state, limit = 500) {
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
// useStateBuildings — top 200 for one state (maps to GET /states/:code/buildings)
// ---------------------------------------------------------------------------

/**
 * @param {string|null} stateCode  2-letter code e.g. "FL", "TX"
 * @param {{ limit?: number, minScore?: number, sort?: string }} [opts]
 * @returns {{ buildings: any[], stateName: string, total: number, loading: boolean, error: string|null, isLive: boolean }}
 */
export function useStateBuildings(stateCode, { limit = 200, minScore = 0, sort } = {}) {
  const [buildings, setBuildings] = useState([]);
  const [stateName, setStateName] = useState('');
  const [total,    setTotal]      = useState(0);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState(null);
  const [isLive,   setIsLive]     = useState(true);

  useEffect(() => {
    if (!stateCode) {
      setBuildings([]);
      setStateName('');
      setTotal(0);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setIsLive(true);

    async function load() {
      try {
        const res = await apiClient.stateBuildings(stateCode, { limit, min_score: minScore, sort });
        if (!cancelled) {
          setBuildings(res.buildings ?? []);
          setStateName(res.state_name ?? stateCode);
          setTotal(res.total_in_state ?? 0);
          setIsLive(true);
        }
      } catch (err) {
        if (!cancelled) {
          // Fallback: filter mock data by state code using approximate name match
          const codeToName = {
            TX:'Texas', FL:'Florida', GA:'Georgia', NC:'North Carolina',
            LA:'Louisiana', AL:'Alabama', SC:'South Carolina', TN:'Tennessee',
            VA:'Virginia', MS:'Mississippi', AR:'Arkansas', KY:'Kentucky',
            OK:'Oklahoma', MO:'Missouri', MD:'Maryland', DE:'Delaware',
            AZ:'Arizona', NM:'New Mexico', KS:'Kansas', IN:'Indiana',
            IL:'Illinois', WV:'West Virginia',
          };
          const name = codeToName[stateCode.toUpperCase()] ?? stateCode;
          const filtered = MOCK.filter(b => b.state?.toLowerCase() === name.toLowerCase()).slice(0, limit);
          setBuildings(filtered);
          setStateName(name);
          setTotal(filtered.length);
          setError(err.message ?? 'Using demo data');
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateCode, limit, minScore, sort]);

  return { buildings, stateName, total, loading, error, isLive };
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
