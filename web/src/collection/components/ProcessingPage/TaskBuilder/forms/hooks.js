import { useCallback } from "react";
import lodash from "lodash";

/**
 * Update numeric field
 */
export function useNumber(request, onChange, field) {
  return useHandler(request, onChange, field, Number);
}

/**
 * Update field by event.
 */
export function useHandler(
  request,
  onChange,
  field,
  convert = (value) => value
) {
  return useCallback(
    (event, newValue) => {
      onChange(
        updateAttr(request, field, convert(newValue || event.target.value))
      );
    },
    [request, onChange]
  );
}

/**
 * Update field by value.
 */
export function useUpdate(request, onChange, field) {
  return useCallback(
    (value) => {
      onChange(updateAttr(request, field, value));
    },
    [request, onChange]
  );
}

/**
 * Update bool.
 */
export function updateAttr(object, field, value) {
  if (value === "" || (Array.isArray(value) && value.length === 0)) {
    value = undefined;
  }
  return lodash.omitBy({ ...object, [field]: value }, lodash.isNil);
}
