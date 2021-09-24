import useUpdateFileMatch, { UpdateFileMatchFn } from "./useUpdateFileMatch";
import { useCallback } from "react";
import { FileMatch } from "../../../model/Match";

/**
 * Delete/restore match API.
 */
export type DeleteMatchAPI = {
  deleteMatch: UpdateFileMatchFn;
  restoreMatch: UpdateFileMatchFn;
};

/**
 * Get a callback to delete/restore file match (mark it as a false-positive).
 */
export default function useDeleteMatch(): DeleteMatchAPI {
  const updateMatch = useUpdateFileMatch();

  const deleteMatch = useCallback(
    (match: FileMatch) => updateMatch({ ...match, falsePositive: true }),
    []
  );

  const restoreMatch = useCallback(
    (match: FileMatch) => updateMatch({ ...match, falsePositive: false }),
    []
  );

  return {
    deleteMatch,
    restoreMatch,
  };
}
