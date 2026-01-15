import { Box, Input } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { PatternQuery } from "../../utils/PatternQuery";
import { searchCtx } from "./SpeedSearch-hooks";

// Excluded characters:
//   \p{Control} matches any control character.
//   \p{Format} matches any invisible formatting control character.
//   \p{Line_Separator} matches any line separator character.
//   \p{Paragraph_Separator} matches any paragraph separator character.
// ref: https://stackoverflow.com/a/12054775
// ref: https://stackoverflow.com/a/31976060
const START_SPEED_SEARCH = /^[^\p{Control}\p{Format}\p{Line_Separator}\p{Paragraph_Separator}\\/<>:"|?*]$/u;

interface SpeedSearchProps {
  onSearch: (value: PatternQuery) => void;
  onHide: () => void;
  onNavigate?: (value: PatternQuery, direction: "up" | "down") => void;
  children?: React.ReactNode;
}

function IsValidSpeedSearchStart(key: string): boolean {
  return key.match(START_SPEED_SEARCH) !== null;
}

export function SpeedSearch(props: SpeedSearchProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [isSpeedSearchVisible, setSpeedSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<PatternQuery | undefined>(undefined);
  const onHide = props.onHide;

  useEffect(() => {
    if (isSpeedSearchVisible) {
      ref.current?.focus();
    }
  }, [isSpeedSearchVisible]);

  const onHideSpeedSearch = useCallback(() => {
    setSpeedSearchVisible(false);
    setSearchQuery(undefined);
    onHide();
  }, [onHide]);

  return (
    <Box
      className={"SpeedSearchHost"}
      style={{ flexGrow: 1, position: "relative" }}
      onKeyDown={(e) => {
        if (!e.ctrlKey && !e.altKey && !e.metaKey && IsValidSpeedSearchStart(e.key)) {
          setSpeedSearchVisible(true);
        }
        if (isSpeedSearchVisible && ref.current && searchQuery) {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            props.onNavigate?.(searchQuery, e.key === "ArrowUp" ? "up" : "down");
          }
        }
      }}
    >
      {isSpeedSearchVisible && (
        <Box position={"absolute"} top={-10} left={0} right={0} zIndex={10} bg={"gray.800"}>
          <Input
            ref={ref}
            onBlur={onHideSpeedSearch}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter") {
                onHideSpeedSearch();
              }
            }}
            onChange={(e) => {
              const query = new PatternQuery(e.target.value);
              setSearchQuery(query);
              props.onSearch(query);
            }}
          />
        </Box>
      )}
      <searchCtx.Provider value={searchQuery}>{props.children}</searchCtx.Provider>
    </Box>
  );
}
