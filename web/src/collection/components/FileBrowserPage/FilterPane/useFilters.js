import { isEqual, mergeWith, isArray } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { selectFileFilters } from "../../../state/selectors";
import { useCallback, useEffect, useState } from "react";
import { updateFilters } from "../../../state/fileList/actions";

/**
 * Filters merge customizer.
 */
function replaceArrays(objValue, srcValue) {
  if (isArray(objValue)) {
    return srcValue;
  }
}

/**
 * Hook to smoothly update hooks
 */
export function useFilters() {
  // Access current redux state
  const filters = useSelector(selectFileFilters);
  const dispatch = useDispatch();

  const [changes, setChanges] = useState({}); // unsaved changes
  const [saveHandle, setSaveHandle] = useState(null); // timeout handle

  const saveChanges = useCallback(() => {
    const updated = Object.assign({}, filters, changes);
    if (!isEqual(updated, filters)) {
      dispatch(updateFilters(changes));
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
