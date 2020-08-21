import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FingerprintType } from "../Fingerprints/type";
import Paper from "@material-ui/core/Paper";
import SelectableTabs from "./SelectableTabs";
import SelectableTab from "./SelectableTab";
import ExifPanel from "./ExifPanel";
import ObjectsPanel from "./ObjectsPanel";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
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
      return "div";
    case Tab.objects:
      return ObjectsPanel;
    case Tab.exif:
      return ExifPanel;
    default:
      console.error(`Unknown tab: ${tab}`);
      return "div";
  }
}

function VideoInformationPane(props) {
  const { file, onJump, className } = props;
  const classes = useStyles();
  const [tab, setTab] = useState(Tab.info);

  const DataPanel = dataComponent(tab);

  return (
    <Paper className={clsx(classes.root, className)}>
      <SelectableTabs value={tab} onChange={setTab} className={classes.tabs}>
        <SelectableTab label="Video Information" value={Tab.info} />
        <SelectableTab label="Objects" value={Tab.objects} />
        <SelectableTab label="EXIF Data" value={Tab.exif} />
      </SelectableTabs>
      <DataPanel file={file} className={classes.data} onJump={onJump} />
    </Paper>
  );
}

VideoInformationPane.propTypes = {
  /**
   * Video file
   */
  file: FingerprintType.isRequired,
  /**
   * Jump to a particular object
   */
  onJump: PropTypes.func,
  className: PropTypes.string,
};

export default VideoInformationPane;
