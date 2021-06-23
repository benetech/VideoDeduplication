import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../prop-types/FileType";
import FileInfoPanel from "./FileInfoPanel";
import ObjectsPanel from "./ObjectsPanel";
import { useIntl } from "react-intl";
import {
  SelectableTab,
  SelectableTabs,
} from "../../../common/components/SelectableTabs";
import ObjectAPI from "../../../application/objects/ObjectAPI";
import MetadataPane from "./MetadataPane";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  tabs: {
    margin: theme.spacing(3),
    width: "min-content",
  },
  metadata: {
    height: "100%",
  },
}));

/**
 * Tabs enum for ideomatic access
 */
const Tab = {
  info: "info",
  objects: "objects",
  metadata: "metadata",
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
    metadata: showIf(tab === Tab.metadata),
  };
}

function useMessages() {
  const intl = useIntl();
  return {
    info: intl.formatMessage({ id: "file.tabInfo" }),
    objects: intl.formatMessage({ id: "file.tabObjects" }),
    metadata: intl.formatMessage({ id: "metadata.title" }),
  };
}

function VideoInformation(props) {
  const { file, onJump, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [tab, setTab] = useState(Tab.info);

  const objectsAPI = ObjectAPI.use();
  const { objects = [] } = objectsAPI.useFileObjects(file.id);
  const styles = contentStyles(tab);

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <SelectableTabs value={tab} onChange={setTab} className={classes.tabs}>
        <SelectableTab label={messages.info} value={Tab.info} />
        <SelectableTab
          label={messages.objects}
          value={Tab.objects}
          data-selector="ObjectsTab"
        />
        <SelectableTab label={messages.metadata} value={Tab.metadata} />
      </SelectableTabs>
      <FileInfoPanel file={file} style={styles.info} />
      <ObjectsPanel
        file={file}
        objects={objects}
        style={styles.objects}
        onJump={onJump}
      />
      <MetadataPane
        data={file?.exif?.Json_full_exif}
        className={classes.metadata}
        style={styles.metadata}
      />
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
