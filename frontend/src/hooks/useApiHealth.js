/**
 * useApiHealth
 *
 * Fires a single GET /health request once per app session (Header never
 * unmounts). Returns isLive=true only when the backend responds 200 OK.
 */
import { useEffect, useState } from 'react';
import { BASE_URL, isApiConfigured } from '../utils/api';

/**
 * @returns {{ isLive: boolean, checked: boolean }}
 */
export function useApiHealth() {
  const [isLive, setIsLive]   = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isApiConfigured) {
      setChecked(true);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    fetch(`${BASE_URL}/health`, { signal: controller.signal })
      .then((r) => { if (r.ok) setIsLive(true); })
      .catch(() => { /* timeout or network error → stays false */ })
      .finally(() => {
        clearTimeout(timeout);
        setChecked(true);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []); // run once — Header never unmounts

  return { isLive, checked };
}
