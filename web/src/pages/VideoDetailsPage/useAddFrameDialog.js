import React, { useCallback, useState } from "react";
import AddFrameDialog from "./AddFrameDialog";

/**
 *
 */
export default function useAddFrameDialog() {
  const [data, setData] = useState(null);

  const showDialog = useCallback((file, time) => {
    setData({ file, time });
  }, []);

  const closeDialog = useCallback(() => {
    setData(null);
  });

  if (data == null) {
    return [showDialog, null];
  }

  const dialog = (
    <AddFrameDialog
      open
      file={data.file}
      time={data.time}
      onClose={closeDialog}
    />
  );
  return [showDialog, dialog];
}
