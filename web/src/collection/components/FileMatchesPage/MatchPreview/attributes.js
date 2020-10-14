import React from "react";
import { formatDate, formatDuration } from "../../../../common/helpers/format";
import Bool from "../../../../common/components/Bool";

export const attributes = [
  {
    title: "file.length",
    value: (file, intl) => formatDuration(file.metadata.length, intl, true),
  },
  {
    title: "file.creationDate",
    value: (file, intl) => formatDate(file.metadata.created, intl),
  },
  {
    title: "file.hasExif",
    // eslint-disable-next-line react/display-name
    value: (file) => <Bool value={file.metadata.hasEXIF} />,
  },
  {
    title: "file.sha256Short",
    value: (file) => `#${file.hash.slice(0, 7)}`,
  },
  {
    title: "file.hasAudio",
    // eslint-disable-next-line react/display-name
    value: (file) => <Bool value={file.metadata.hasAudio} />,
  },
];

export default attributes;
