import { isArray, isEqual, mergeWith } from "lodash";
import { useCallback, useEffect, useState } from "react";
import useFilesColl from "./useFilesColl";
import { FileFilters } from "../../../model/VideoFile";

/**
 * Filters merge customizer.
 */
function replaceArrays(objValue: any, srcValue: any): any {
  if (isArray(objValue)) {
    return srcValue;
  }
}

/**
 * Hook to smoothly update main file collection filters.
 */
export function useFilters(): [
  FileFilters,
  (updates: Partial<FileFilters>) => void
] {
  // Access current redux state
  const collection = useFilesColl();
  const filters = collection.params;

  const [changes, setChanges] = useState<Partial<FileFilters>>({}); // unsaved changes
  const [saveHandle, setSaveHandle] = useState<NodeJS.Timeout | null>(null); // timeout handle

  const saveChanges = useCallback(() => {
    const updated = Object.assign({}, filters, changes);
    if (!isEqual(updated, filters)) {
      collection.updateParams(changes);
      setChanges({});
    }
  }, [changes, filters]);

  useEffect(() => {
    if (saveHandle != null) {
      clearTimeout(saveHandle);
    }
    const newHandle = setTimeout(saveChanges, 1000);
    setSaveHandle(newHandle);
  }, [changes]);

  const editChanges = useCallback(
    (updates: Partial<FileFilters>) => {
      const updatedChanges = mergeWith({}, changes, updates, replaceArrays);
      setChanges(updatedChanges);
    },
    [changes]
  );

  return [Object.assign({}, filters, changes), editChanges];
}
