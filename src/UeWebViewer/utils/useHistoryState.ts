import { useCallback, useEffect, useMemo } from "react";

function getCurrentPath(): string | undefined {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return params.get("path") || undefined;
}

/**
 * We could use encodeURIComponent, but the slash is actually a valid character in a path.
 * And we want a readable URL.
 */
function stupidEncodePath(path: string): string {
  return path
    .replace(/ /g, "%20") //
    .replace(/#/g, "%23")
    .replace(/%/g, "%25")
    .replace(/&/g, "%26")
    .replace(/\?/g, "%3F");
}

export function useHistoryState(onChoosePath: (path: string | undefined) => void) {
  // We useMemo instead of useRef because useMemo discards the value during hot reload.
  const lastPathReported: { current: string | undefined } = useMemo(() => ({ current: undefined }), []);

  const reloadPath = useCallback(() => {
    const currentPath = getCurrentPath();
    if (currentPath !== lastPathReported.current) {
      onChoosePath(currentPath);
      lastPathReported.current = currentPath;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener("popstate", reloadPath);
    return () => window.removeEventListener("popstate", reloadPath);
  }, [reloadPath]);

  useEffect(reloadPath, [reloadPath]);
}

export function navigate(path: string | undefined) {
  const currentPath = window.history.state?.path;
  if (currentPath !== path) {
    const url = path ? "?path=" + stupidEncodePath(path) : "?";
    const hash = window.location.hash;
    window.history.pushState({ path }, "", url + hash);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}
