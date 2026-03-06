import { useState, useEffect } from 'react';

type DataType = 'projects' | 'skills' | 'experience';

interface UseSalesforceResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useSalesforce<T>(type: DataType): UseSalesforceResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/.netlify/functions/portfolio-data?type=${type}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
        }
        const json: T[] = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [type]);

  return { data, loading, error };
}
