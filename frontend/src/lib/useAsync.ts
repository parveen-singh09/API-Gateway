import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "./format";

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
}

// Minimal data loader: runs on mount + when `deps` change, ignores stale
// results on unmount/re-fetch. Enough for this admin console without pulling
// in a full server-cache library.
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    fn()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, error, isLoading, reload };
}
