import lodash from "lodash";
import { useMemo } from "react";

/**
 * Get unique identifier.
 */
export default function useUniqueId(prefix = ""): string {
  return useMemo(() => lodash.uniqueId(prefix), []);
}
