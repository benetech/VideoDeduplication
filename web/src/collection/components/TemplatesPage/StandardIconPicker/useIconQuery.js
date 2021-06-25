import * as GameIcon from "react-icons/gi";
import { useMemo } from "react";

/**
 * Get mapping from lower-case names to actual icon keys.
 */
function getIconNamesMap() {
  const keys = Object.keys(GameIcon).filter((key) => key.startsWith("Gi"));
  const result = new Map();
  for (const key of keys) {
    result.set(key.toLowerCase(), key);
  }
  return result;
}

/**
 * Split query into separate words.
 */
function splitQuery(query) {
  let result = query.split(/\s+/).map((word) => word.toLowerCase());
  if (result.length > 1) {
    result = result.filter((item) => item.length > 0);
  }
  return result;
}

/**
 * Select options that contain any of the query words.
 */
function filterOptions(options, queryWords) {
  const filtered = options.filter((name) =>
    queryWords.some((word) => name.includes(word))
  );
  if (queryWords.length <= 1) {
    return filtered;
  }
  const weighted = filtered.map((name) => [
    queryWords.filter((word) => name.includes(word)).length,
    name,
  ]);
  return weighted.sort((a, b) => b[0] - a[0]).map((pair) => pair[1]);
}

function useIconQuery(query) {
  // Get mapping from lower-case name to real icon names for all icons
  const origNames = useMemo(() => getIconNamesMap());

  // Get all lower-cased icon names
  const lowerCased = useMemo(() => [...origNames.keys()]);

  // Split query into separate words
  const queryWords = useMemo(() => splitQuery(query), [query]);

  // Select lower-cased icon names matching query words
  const selectedLower = useMemo(
    () => filterOptions(lowerCased, queryWords),
    [query]
  );

  // Get original icon names from selected lower-cased names
  return useMemo(
    () => selectedLower.map((lower) => origNames.get(lower)),
    [selectedLower]
  );
}

export default useIconQuery;
