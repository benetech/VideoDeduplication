import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../../../prop-types/TaskType";
import FrameMatch from "./FrameMatch";
import LabeledSwitch from "../../../../../../common/components/LabeledSwitch";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  match: {
    margin: theme.spacing(1),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    blur: intl.formatMessage({ id: "actions.blurFrames" }),
    blurHelp: intl.formatMessage({ id: "actions.blurFrames.help" }),
  };
}

function FindFrameResultsOverview(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const [blur, setBlur] = useState(true);
  const messages = useMessages();
  const matches = task?.result?.matches || [];

  return (
    <div className={clsx(className)} {...other}>
      <LabeledSwitch
        value={blur}
        onChange={setBlur}
        label={messages.blur}
        tooltip={messages.blurHelp}
      />
      <div>
        {matches.map((match) => (
          <FrameMatch
            match={match}
            className={classes.match}
            key={`${match.fileId}:${match.startMs}`}
            blur={blur}
          />
        ))}
      </div>
    </div>
  );
}

FindFrameResultsOverview.propTypes = {
  /**
   * Find-Frame task which results will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default FindFrameResultsOverview;
