import { useCallback, useEffect, useState } from 'react';

export function useAsync<T>(load: () => Promise<T>, dependencies: readonly unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await load()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Ocorreu um erro inesperado.'); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => { void refresh(); }, [refresh]);
  return { data, loading, error, refresh, setData };
}
