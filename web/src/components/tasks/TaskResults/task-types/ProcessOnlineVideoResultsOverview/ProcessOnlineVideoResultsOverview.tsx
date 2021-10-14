import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { ProcessOnlineVideoRequest, Task } from "../../../../../model/Task";
import ProcessedFile from "./ProcessedFile";
import LabeledSwitch from "../../../../basic/LabeledSwitch";
import { useIntl } from "react-intl";
import LazyLoad from "react-lazyload";
import { useShowFile } from "../../../../../routing/hooks";

const useStyles = makeStyles<Theme>((theme) => ({
  matches: {
    maxHeight: "50vh",
    overflowY: "auto",
  },
  match: {
    marginBottom: theme.spacing(2),
  },
  header: {
    display: "flex",
    margin: theme.spacing(2),
    marginLeft: 0,
  },
  title: { ...theme.mixins.title4, fontWeight: "bold", flexGrow: 2 },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    blur: intl.formatMessage({
      id: "actions.blurVideos",
    }),
    blurHelp: intl.formatMessage({
      id: "actions.blurVideos.help",
    }),

    title(count: number) {
      return intl.formatMessage(
        {
          id: "task.onlineFiles.description",
        },
        {
          count,
        }
      );
    },
  };
}

function ProcessOnlineVideoResultsOverview(
  props: ProcessOnlineVideoResultsOverviewProps
): JSX.Element {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const [blur, setBlur] = useState(true);
  const messages = useMessages();
  const files = task?.result?.files || [];
  const eagerFiles = useMemo(() => files.slice(0, 5), [files]);
  const lazyFiles = useMemo(() => files.slice(5), [files]);
  const showFile = useShowFile();
  return (
    <div className={clsx(className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{messages.title(files.length)}</div>
        <LabeledSwitch
          value={blur}
          onChange={setBlur}
          label={messages.blur}
          tooltip={messages.blurHelp}
        />
      </div>
      <div className={classes.matches}>
        {eagerFiles.map((file, index) => (
          <ProcessedFile
            file={file}
            className={classes.match}
            blur={blur}
            key={index}
            onSelect={showFile}
          />
        ))}
        {lazyFiles.map((file, index) => (
          <LazyLoad height={146} key={index} overflow>
            <ProcessedFile
              file={file}
              className={classes.match}
              blur={blur}
              onSelect={showFile}
            />
          </LazyLoad>
        ))}
      </div>
    </div>
  );
}

type ProcessOnlineVideoResultsOverviewProps = {
  /**
   * ProcessOnlineVideo task which results will be displayed.
   */
  task: Task<ProcessOnlineVideoRequest>;
  className?: string;
};
export default ProcessOnlineVideoResultsOverview;
