import React, { useCallback, useState } from "react";
import FrameDialog from "./FrameDialog";

/**
 * Hook to manage frame preview dialog.
 */
export default function useFrameDialog() {
  const [match, setMatch] = useState(null);
  const handleClose = useCallback(() => setMatch(null));

  if (match == null) {
    return [setMatch, null];
  }

  const dialog = <FrameDialog open match={match} onClose={handleClose} />;
  return [setMatch, dialog];
}
