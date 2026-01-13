import { type DependencyList, useEffect, useMemo, useRef, useState } from "react";

/**
 * Compute an async value based on deps, with loading and error states.
 * When deps change, the previous computation is aborted.
 */
export function useAsyncCompute<R>(fn: (signal: AbortSignal) => Promise<R>, deps: DependencyList) {
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<R | null>(null);
  const committedVersionRef = useRef<number | null>(null);
  const [, forceUpdate] = useState({});

  const fnRef = useRef(fn);
  fnRef.current = fn;

  // The version is regenerated whenever deps change
  const versionRef = useRef(0);
  const currentVersion = useMemo(() => {
    versionRef.current += 1;
    return versionRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve()
      .then(() => checkAborted(controller.signal)) // fake out Strict Mode
      .then(() => fnRef.current(controller.signal))
      .then((result) => {
        if (controller.signal.aborted) return;
        committedVersionRef.current = currentVersion;
        setError(null);
        setData(result);
        forceUpdate({});
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        committedVersionRef.current = currentVersion;
        console.error("Error in useAsyncCompute:", err);
        setError(err);
        setData(null);
        forceUpdate({});
      });

    return () => {
      controller.abort();
    };
  }, [currentVersion]);

  const isLoading = committedVersionRef.current !== currentVersion;
  return { data: isLoading ? null : data, error: isLoading ? null : error, isLoading };
}

export function checkAborted(signal: AbortSignal) {
  if (signal.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}
