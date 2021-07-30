import React from "react";
import PropTypes from "prop-types";
import { formatDate, formatDuration } from "../../../lib/helpers/format";
import Bool from "../../../components/basic/Bool";

export const AttrType = PropTypes.shape({
  title: PropTypes.string.isRequired,
  value: PropTypes.func.isRequired,
});

export const localAttributes = [
  {
    title: "file.length",
    value: (file, intl) => formatDuration(file?.metadata?.length, intl, true),
  },
  {
    title: "file.creationDate",
    value: (file, intl) => formatDate(file?.metadata?.created, intl),
  },
  {
    title: "file.hasExif",
    // eslint-disable-next-line react/display-name
    value: (file) => <Bool value={file?.metadata?.hasEXIF} />,
  },
  {
    title: "file.sha256Short",
    value: (file) => `#${file?.hash?.slice(0, 7)}`,
  },
  {
    title: "file.hasAudio",
    // eslint-disable-next-line react/display-name
    value: (file) => <Bool value={file?.metadata?.hasAudio} />,
  },
];

export const remoteAttributes = [
  {
    title: "file.source",
    value: (file) => file?.contributor?.repository?.name,
  },
  {
    title: "file.owner",
    value: (file) => file?.contributor?.name,
  },
  {
    title: "file.sha256Short",
    value: (file) => `#${file?.hash?.slice(0, 7)}`,
  },
];
