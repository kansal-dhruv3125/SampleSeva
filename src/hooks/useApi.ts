import { useCallback, useEffect, useRef, useState } from "react";
import type { DependencyList } from "react";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiResult<T> extends ApiState<T> {
  refetch: () => void;
}

/**
 * Minimal data-fetching hook for API-backed pages (Phase 5F).
 *
 * Runs `fetcher` on mount and whenever `deps` change or `refetch()` is
 * called, exposing loading/error/data for the UI. The fetcher itself is read
 * through a ref so callers can inline it without stale-closure issues.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: DependencyList): UseApiResult<T> {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : "Something went wrong",
          });
        }
      });
    return () => {
      cancelled = true;
    };
    // `fetcher` is intentionally excluded (read via ref); deps drive refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { ...state, refetch };
}
