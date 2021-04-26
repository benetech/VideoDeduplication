import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../prop-types/FileType";
import FileInfoPanel from "./FileInfoPanel";
import ObjectsPanel from "./ObjectsPanel";
import ExifPanel from "./ExifPanel";
import { useIntl } from "react-intl";
import {
  SelectableTab,
  SelectableTabs,
} from "../../../common/components/SelectableTabs";
import useLoadFileObjects from "./useLoadFileObjects";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  tabs: {
    margin: theme.spacing(3),
    width: "min-content",
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
 * Get styles to hide element if condition is false.
 */
function showIf(cond) {
  if (!cond) {
    return { display: "none" };
  } else {
    return {};
  }
}

/**
 * Select data-presentation panel
 */
function contentStyles(tab) {
  return {
    info: showIf(tab === Tab.info),
    objects: showIf(tab === Tab.objects),
    exif: showIf(tab === Tab.exif),
  };
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

  const { objects = [] } = useLoadFileObjects(file.id);
  const styles = contentStyles(tab);

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <SelectableTabs value={tab} onChange={setTab} className={classes.tabs}>
        <SelectableTab label={messages.info} value={Tab.info} />
        {objects.length > 0 && (
          <SelectableTab
            label={messages.objects}
            value={Tab.objects}
            data-selector="ObjectsTab"
          />
        )}
        <SelectableTab label={messages.exif} value={Tab.exif} />
      </SelectableTabs>
      <FileInfoPanel file={file} style={styles.info} />
      <ObjectsPanel objects={objects} style={styles.objects} onJump={onJump} />
      <ExifPanel file={file} style={styles.exif} />
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
