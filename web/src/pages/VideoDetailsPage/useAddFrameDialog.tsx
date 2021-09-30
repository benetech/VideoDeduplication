import React, { useCallback, useState } from "react";
import AddFrameDialog from "./AddFrameDialog";
import { FrameDescriptor, VideoFile } from "../../model/VideoFile";

type UseAddFrameDialogResults = [
  (file: VideoFile, time: number) => void,
  JSX.Element | null
];

/**
 * Hook to manage AddFrameDialog dialog.
 */
export default function useAddFrameDialog(): UseAddFrameDialogResults {
  const [data, setData] = useState<FrameDescriptor | null>(null);
  const showDialog = useCallback((file, time) => setData({ file, time }), []);
  const closeDialog = useCallback(() => setData(null), []);

  if (data == null) {
    return [showDialog, null];
  }

  const dialog = (
    <AddFrameDialog
      open={true}
      file={data.file}
      time={data.time}
      onClose={closeDialog}
    />
  );
  return [showDialog, dialog];
}
