import React from "react";
import { formatBool, formatDuration } from "../../../../common/helpers/format";
import Bool from "../../../../common/components/Bool";

export const attributes = [
  {
    title: "file.length",
    value: (file, intl) => formatDuration(file.metadata.length, intl, true),
  },
  {
    title: "file.creationDate",
    value: (file, intl) => intl.formatMessage({ id: "value.unknown" }),
  },
  {
    title: "file.hasExif",
    value: (file) => <Bool value={file.metadata.hasEXIF} />,
  },
  {
    title: "file.sha256Short",
    value: () => "#SKS329",
  },
  {
    title: "file.hasAudio",
    value: (file) => <Bool value={file.metadata.hasAudio} />,
  },
];

export default attributes;
