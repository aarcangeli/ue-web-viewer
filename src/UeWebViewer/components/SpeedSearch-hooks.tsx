import { createContext, useContext } from "react";
import type { PatternQuery } from "../../utils/PatternQuery";

export const searchCtx = createContext<PatternQuery | undefined>(undefined);

export function useSearchQuery(): PatternQuery | undefined {
  return useContext(searchCtx);
}
