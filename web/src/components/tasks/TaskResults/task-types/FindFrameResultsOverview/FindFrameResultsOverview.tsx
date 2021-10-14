import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { FindFrameRequest, Task } from "../../../../../model/Task";
import FrameMatch from "./FrameMatch";
import LabeledSwitch from "../../../../basic/LabeledSwitch";
import { useIntl } from "react-intl";
import LazyLoad from "react-lazyload";
import useFrameDialog from "./useFrameDialog";

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
      id: "actions.blurFrames",
    }),
    blurHelp: intl.formatMessage({
      id: "actions.blurFrames.help",
    }),

    title(count: number) {
      return intl.formatMessage(
        {
          id: "task.frameMatches.description",
        },
        {
          count,
        }
      );
    },
  };
}

function FindFrameResultsOverview(
  props: FindFrameResultsOverviewProps
): JSX.Element {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const [blur, setBlur] = useState(true);
  const messages = useMessages();
  const matches = task?.result?.matches || [];
  const [showFrame, frameDialog] = useFrameDialog();
  const eagerMatches = useMemo(() => matches.slice(0, 5), [matches]);
  const lazyMatches = useMemo(() => matches.slice(5), [matches]);
  return (
    <div className={clsx(className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{messages.title(matches.length)}</div>
        <LabeledSwitch
          value={blur}
          onChange={setBlur}
          label={messages.blur}
          tooltip={messages.blurHelp}
        />
      </div>
      <div className={classes.matches}>
        {eagerMatches.map((match, index) => (
          <FrameMatch
            match={match}
            className={classes.match}
            blur={blur}
            key={index}
            onSelect={showFrame}
          />
        ))}
        {lazyMatches.map((match, index) => (
          <LazyLoad height={146} key={index} overflow>
            <FrameMatch
              match={match}
              className={classes.match}
              blur={blur}
              onSelect={showFrame}
            />
          </LazyLoad>
        ))}
      </div>
      {frameDialog}
    </div>
  );
}

type FindFrameResultsOverviewProps = {
  /**
   * Find-Frame task which results will be displayed.
   */
  task: Task<FindFrameRequest>;
  className?: string;
};
export default FindFrameResultsOverview;
