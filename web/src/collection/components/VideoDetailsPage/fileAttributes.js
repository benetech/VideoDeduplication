import React from "react";
import Bool from "../../../common/components/Bool";
import FileType from "./FileType";
import { formatDuration } from "../../../common/helpers/format";
import ValueBadge from "./ValueBadge";

/**
 * General video-file attributes
 */
export const fileAttributes = [
  {
    title: "file.uploadedBy",
    value: () => "You",
  },
  {
    title: "file.name",
    value: (file) => file.filename,
  },
  {
    title: "file.type",
    // eslint-disable-next-line react/display-name
    value: (file) => <FileType type={file.metadata.fileType} />,
  },
  {
    title: "file.length",
    value: (file) =>
      file.metadata.length != null &&
      formatDuration(file.metadata.length, null, false),
  },
  {
    title: "file.frames",
    value: (file) => file.exif?.General_FrameCount,
  },
  {
    title: "file.codec",
    // eslint-disable-next-line react/display-name
    value: (file) => <ValueBadge type={file.exif?.Video_Format} />,
  },
  {
    title: "file.sha256hash",
    value: (file) => file.hash != null && `#${file.hash.slice(0, 10)}`,
  },
  {
    title: "file.exif",
    // eslint-disable-next-line react/display-name
    value: (file) => <Bool value={file.exif != null} />,
  },
  {
    title: "file.fingerprint",
    value: (file) => file.fingerprint && `#${file.fingerprint.slice(0, 10)}`,
  },
  {
    title: "file.hasAudio",
    // eslint-disable-next-line react/display-name
    value: (file) => <Bool value={file.metadata.hasAudio} />,
  },
];
