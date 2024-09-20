import { useCallback, useEffect, useRef } from "react";

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
  return path.replace(/ /g, "%20").replace(/#/g, "%23").replace(/%/g, "%25").replace(/&/g, "%26").replace(/\?/g, "%3F");
}

export function useHistoryState(onChoosePath: (path: string | undefined) => void) {
  const lastPathReported = useRef<string | undefined>(undefined);

  const reloadPath = useCallback(() => {
    const currentPath = getCurrentPath();
    if (currentPath !== lastPathReported.current) {
      onChoosePath(currentPath);
      lastPathReported.current = currentPath;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", reloadPath);
    return () => window.removeEventListener("popstate", reloadPath);
  }, [reloadPath]);

  useEffect(reloadPath, []);
}

export function useNavigate() {
  return useCallback((path: string | undefined) => {
    const currentPath = window.history.state?.path;
    console.log("navigate: ", path, currentPath);
    if (currentPath !== path) {
      let url = path ? "?path=" + stupidEncodePath(path) : "?";
      const hash = window.location.hash;
      window.history.pushState({ path }, "", url + hash);
    }
  }, []);
}
