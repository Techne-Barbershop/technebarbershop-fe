"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useApi<T>(fetcher: () => Promise<T>, key: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetcher()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active)
          setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => setData(result))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Terjadi kesalahan"),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading, error, refetch };
}

export function useApiPath<T>(
  path: string,
  query?: Record<string, string | number | undefined>,
) {
  const key = path + JSON.stringify(query ?? {});
  return useApi<T>(() => api<T>(path, { query }), key);
}
