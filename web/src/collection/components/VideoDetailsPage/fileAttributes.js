import React from "react";
import Bool from "./Bool";
import FileType from "./FileType";
import { formatDuration } from "../../../common/helpers/format";

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
    value: (file) => <FileType type={file.metadata.fileType} />,
  },
  {
    title: "file.length",
    value: (file) => formatDuration(file.metadata.length, null, false),
  },
  {
    title: "file.frames",
    value: () => null,
  },
  {
    title: "file.codec",
    value: () => null,
  },
  {
    title: "file.avgGrey",
    value: (file) => file.metadata.grayAverage.toFixed(2),
  },
  {
    title: "file.sha256hash",
    value: () => null,
  },
  {
    title: "file.exif",
    value: (file) => <Bool value={file.exif != null} />,
  },
  {
    title: "file.fingerprint",
    value: () => null,
  },
  {
    title: "file.hasAudio",
    value: (file) => <Bool value={file.metadata.hasAudio} />,
  },
];
