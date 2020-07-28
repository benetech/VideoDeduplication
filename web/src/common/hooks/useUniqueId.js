import lodash from "lodash";
import { useEffect, useState } from "react";

export default function useUniqueId(prefix = "") {
  const [id, setId] = useState("");
  useEffect(() => setId(lodash.uniqueId(prefix)), []);
  return id;
}
