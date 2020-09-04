import lodash from "lodash";
import { useMemo } from "react";

export default function useUniqueId(prefix = "") {
  return useMemo(() => lodash.uniqueId(prefix), []);
}
