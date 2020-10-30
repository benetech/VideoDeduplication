import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../FileBrowserPage/FileType";
import FileInfoPanel from "./FileInfoPanel";
import ObjectsPanel from "./ObjectsPanel";
import ExifPanel from "./ExifPanel";
import { useIntl } from "react-intl";
import {
  SelectableTab,
  SelectableTabs,
} from "../../../common/components/SelectableTabs";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  tabs: {
    maxWidth: 400,
    margin: theme.spacing(3),
  },
  data: {},
}));

/**
 * Tabs enum for ideomatic access
 */
const Tab = {
  info: "info",
  objects: "objects",
  exif: "exif",
};

/**
 * Select data-presentation panel
 */
function dataComponent(tab) {
  switch (tab) {
    case Tab.info:
      return FileInfoPanel;
    case Tab.objects:
      return ObjectsPanel;
    case Tab.exif:
      return ExifPanel;
    default:
      console.error(`Unknown tab: ${tab}`);
      return "div";
  }
}

function useMessages() {
  const intl = useIntl();
  return {
    info: intl.formatMessage({ id: "file.tabInfo" }),
    objects: intl.formatMessage({ id: "file.tabObjects" }),
    exif: intl.formatMessage({ id: "file.tabExif" }),
  };
}

function VideoInformation(props) {
  const { file, onJump, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [tab, setTab] = useState(Tab.info);

  const DataPanel = dataComponent(tab);

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <SelectableTabs value={tab} onChange={setTab} className={classes.tabs}>
        <SelectableTab label={messages.info} value={Tab.info} />
        <SelectableTab label={messages.objects} value={Tab.objects} />
        <SelectableTab label={messages.exif} value={Tab.exif} />
      </SelectableTabs>
      <DataPanel file={file} className={classes.data} onJump={onJump} />
    </div>
  );
}

VideoInformation.propTypes = {
  /**
   * Video file
   */
  file: FileType.isRequired,
  /**
   * Jump to a particular object
   */
  onJump: PropTypes.func,
  className: PropTypes.string,
};

export default VideoInformation;
