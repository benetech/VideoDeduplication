import useUpdateFileMatch from "./useUpdateFileMatch";
import { useCallback } from "react";

/**
 * @typedef {{
 *   retry: number|undefined,
 * }} DeleteMatchOptions
 */

/**
 * Get a callback to delete/restore file match (mark it as a false-positive).
 * @param {DeleteMatchOptions} options
 * @return {{
 *   deleteMatch: function,
 *   restoreMatch: function,
 * }}
 */
export default function useDeleteMatch(options = {}) {
  const { updateMatch } = useUpdateFileMatch(options);

  const deleteMatch = useCallback((match) =>
    updateMatch({ ...match, falsePositive: true })
  );

  const restoreMatch = useCallback((match) =>
    updateMatch({ ...match, falsePositive: false })
  );

  return {
    deleteMatch,
    restoreMatch,
  };
}
