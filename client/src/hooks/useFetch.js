import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

// Simple data-fetching hook. `path` can be null to skip the request.
export function useFetch(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      setData(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get(path)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, reloadKey, ...deps]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, refresh, setData };
}