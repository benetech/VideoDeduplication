import lodash from "lodash";
import { useEffect, useState } from "react";

/**
 * `useValue` is similar to {@link useState} but setValue will have no effect if
 * the argument is equal to the previous value. Thus the client code may safely
 * use object or array values as a dependency for {@link useCallback} or
 * {@link useEffect}.
 * @param requestedValue requested new value
 * @param isEqual function to compare values (default is {@link lodash.isEqual})
 */
export default function useValue(requestedValue, isEqual = lodash.isEqual) {
  const [savedValue, setSavedValue] = useState(requestedValue);
  useEffect(() => {
    const needUpdate = !isEqual(requestedValue, savedValue);
    if (needUpdate) {
      setSavedValue(requestedValue);
    }
  }, [requestedValue, isEqual]);
  return savedValue;
}
