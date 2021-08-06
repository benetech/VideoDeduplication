import { isArray, isEqual, mergeWith } from "lodash";
import { useCallback, useEffect, useState } from "react";
import useFilesColl from "./useFilesColl";

/**
 * Filters merge customizer.
 */
function replaceArrays(objValue, srcValue) {
  if (isArray(objValue)) {
    return srcValue;
  }
}

/**
 * Hook to smoothly update main file collection filters.
 */
export function useFilters() {
  // Access current redux state
  const collection = useFilesColl();
  const filters = collection.params;

  const [changes, setChanges] = useState({}); // unsaved changes
  const [saveHandle, setSaveHandle] = useState(null); // timeout handle

  const saveChanges = useCallback(() => {
    const updated = Object.assign({}, filters, changes);
    if (!isEqual(updated, filters)) {
      collection.setParams(updated);
      setChanges({});
    }
  }, [changes, filters]);

  useEffect(() => {
    clearTimeout(saveHandle);
    const newHandle = setTimeout(saveChanges, 1000);
    setSaveHandle(newHandle);
  }, [changes]);

  const editChanges = useCallback(
    (updates) => {
      const updatedChanges = mergeWith({}, changes, updates, replaceArrays);
      setChanges(updatedChanges);
    },
    [changes]
  );

  return [Object.assign({}, filters, changes), editChanges];
}
