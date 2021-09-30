import React, { useCallback, useState } from "react";
import FrameDialog from "./FrameDialog";
import { FoundFrame } from "../../../../../model/Task";

/**
 * `useFrameDialog` hook results.
 */
type UseFrameDialogResults = [
  (frame: FoundFrame | null) => void,
  JSX.Element | null
];

/**
 * Hook to manage frame preview dialog.
 */
export default function useFrameDialog(): UseFrameDialogResults {
  const [match, setMatch] = useState<FoundFrame | null>(null);
  const handleClose = useCallback(() => setMatch(null), []);

  if (match == null) {
    return [setMatch, null];
  }

  const dialog = (
    <FrameDialog open={true} match={match} onClose={handleClose} />
  );
  return [setMatch, dialog];
}
