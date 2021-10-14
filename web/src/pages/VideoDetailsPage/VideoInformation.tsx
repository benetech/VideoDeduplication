import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { VideoFile } from "../../model/VideoFile";
import FileInfoPanel from "./FileInfoPanel";
import ObjectsPanel from "./ObjectsPanel";
import { useIntl } from "react-intl";
import {
  SelectableTab,
  SelectableTabs,
} from "../../components/basic/SelectableTabs";
import MetadataPane from "./MetadataPane";
import useExclusionsAll from "../../application/api/file-exclusions/useExclusionsAll";
import useObjectsAll from "../../application/api/objects/useObjectsAll";
import { TemplateMatch } from "../../model/Template";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

const useStyles = makeStyles<Theme>((theme) => ({
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
enum Tab {
  info = "info",
  objects = "objects",
  metadata = "metadata",
}

/**
 * Get styles to hide element if condition is false.
 */
function showIf(cond: boolean): CSSProperties {
  if (!cond) {
    return {
      display: "none",
    };
  } else {
    return {};
  }
}

/**
 * Select data-presentation panel
 */
function contentStyles(tab: Tab) {
  return {
    info: showIf(tab === Tab.info),
    objects: showIf(tab === Tab.objects),
    metadata: showIf(tab === Tab.metadata),
  };
}

function useMessages() {
  const intl = useIntl();
  return {
    info: intl.formatMessage({
      id: "file.tabInfo",
    }),
    objects: intl.formatMessage({
      id: "file.tabObjects",
    }),
    metadata: intl.formatMessage({
      id: "metadata.title",
    }),
  };
}

function VideoInformation(props: VideoInformationProps): JSX.Element {
  const { file, onJump, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [tab, setTab] = useState(Tab.info);
  const { objects } = useObjectsAll({
    fileId: file.id,
  });
  const { exclusions } = useExclusionsAll({
    fileId: file.id,
  });
  const styles = contentStyles(tab);
  return (
    <div className={clsx(classes.root, className)} {...other}>
      <SelectableTabs value={tab} onChange={setTab} className={classes.tabs}>
        <SelectableTab label={messages.info} value={Tab.info} />
        {(objects.length > 0 || exclusions.length > 0) && (
          <SelectableTab
            label={messages.objects}
            value={Tab.objects}
            data-selector="ObjectsTab"
          />
        )}
        <SelectableTab label={messages.metadata} value={Tab.metadata} />
      </SelectableTabs>
      <FileInfoPanel file={file} style={styles.info} />
      <ObjectsPanel
        file={file}
        objects={objects}
        style={styles.objects}
        onSelect={onJump}
      />
      <MetadataPane
        data={file?.exif?.Json_full_exif || {}}
        className={classes.metadata}
        style={styles.metadata}
      />
    </div>
  );
}

type VideoInformationProps = {
  /**
   * Video file
   */
  file: VideoFile;

  /**
   * Jump to a particular object
   */
  onJump: (object: TemplateMatch) => void;
  className?: string;
};
export default VideoInformation;
