import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import VideoPlayer from "../../../pages/VideoDetailsPage/VideoPlayer";
import FileSummary from "../FileSummary";
import Button from "../../basic/Button";
import { useHistory } from "react-router-dom";
import { routes } from "../../../pages/routes";
import { useIntl } from "react-intl";
import TimeAttr from "../../basic/TimeAttr/TimeAttr";
import FileType from "../../../prop-types/FileType";

const useStyles = makeStyles((theme) => ({
  summary: {
    margin: theme.spacing(2),
  },
  player: {
    height: 300,
  },
  actions: {
    display: "flex",
    flexShrink: 0,
  },
  button: {
    flexShrink: 0,
    marginLeft: theme.spacing(1),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    frameTime: intl.formatMessage({ id: "task.attr.frameTime" }),
    gotoFile: intl.formatMessage({ id: "actions.gotoFile" }),
    gotoFrame: intl.formatMessage({ id: "actions.gotoFrame" }),
  };
}

function FrameView(props) {
  const { file, timeMillis, className, ...other } = props;
  const classes = useStyles();
  const [player, setPlayer] = useState(null);
  const history = useHistory();
  const messages = useMessages();

  const handleShowFrame = useCallback(() => {
    player?.seekTo(timeMillis / 1000, { units: "seconds" });
  }, [player, timeMillis]);

  const handleShowFile = useCallback(() => {
    history.push(routes.collection.fileURL(file.id));
  }, [file]);

  if (!file) {
    return null;
  }

  return (
    <div className={clsx(className)} {...other}>
      <FileSummary file={file} className={classes.summary}>
        <FileSummary.Name />
        <TimeAttr time={timeMillis} title={messages.frameTime} />
        <div className={classes.actions}>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={handleShowFrame}
            disabled={!player}
          >
            {messages.gotoFrame}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={handleShowFile}
            disabled={!file}
          >
            {messages.gotoFile}
          </Button>
        </div>
      </FileSummary>
      <VideoPlayer
        file={file}
        seekTo={(timeMillis + 1) / (file.metadata.length + 1)}
        className={classes.player}
        onReady={setPlayer}
      />
    </div>
  );
}

FrameView.propTypes = {
  /**
   * File which frame will be displayed.
   */
  file: FileType.isRequired,
  /**
   * Frame time position in video, in milli-seconds.
   */
  timeMillis: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default FrameView;
