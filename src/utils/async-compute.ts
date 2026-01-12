import { type DependencyList, useEffect, useRef, useState } from "react";

function areDepsEqual(a: readonly unknown[], b: readonly unknown[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((val, i) => Object.is(val, b[i]));
}

/**
 * Compute an async value based on deps, with loading and error states.
 * When deps change, the previous computation is aborted.
 */
export function useAsyncCompute<R>(fn: (signal: AbortSignal) => Promise<R>, deps: DependencyList) {
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<R | null>(null);

  const prevDepsRef = useRef<DependencyList | null>(null);
  const isLoading = prevDepsRef.current === null || !areDepsEqual(prevDepsRef.current, deps);

  useEffect(() => {
    prevDepsRef.current = null;
    const controller = new AbortController();

    fn(controller.signal)
      .then((result) => {
        prevDepsRef.current = deps;
        setError(null);
        setData(result);
      })
      .catch((err) => {
        prevDepsRef.current = deps;
        if (err.name === "AbortError") return;
        setError(err);
        setData(null);
      });

    return () => controller.abort();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data: isLoading ? null : data, error: isLoading ? null : error, isLoading };
}

export function checkAborted(signal: AbortSignal) {
  if (signal.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}
