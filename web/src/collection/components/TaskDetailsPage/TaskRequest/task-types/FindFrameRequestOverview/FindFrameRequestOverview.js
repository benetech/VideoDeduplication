import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import useFile from "../../../../../hooks/useFile";
import VideoPlayer from "../../../../VideoDetailsPage/VideoPlayer";
import FileSummary from "../../../../FileSummary";
import Button from "../../../../../../common/components/Button";
import { useHistory } from "react-router-dom";
import { routes } from "../../../../../../routing/routes";
import { useIntl } from "react-intl";
import TimeAttr from "../../../../../../common/components/TimeAttr/TimeAttr";

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

function FindFrameRequestOverview(props) {
  const { request, className, ...other } = props;
  const classes = useStyles();
  const { file } = useFile(request.fileId);
  const [player, setPlayer] = useState(null);
  const history = useHistory();
  const messages = useMessages();

  const handleShowFrame = useCallback(() => {
    player?.seekTo(request.frameTimeSec, { units: "seconds" });
  }, [player, request]);
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
        <TimeAttr
          time={request.frameTimeSec * 1000}
          title={messages.frameTime}
        />
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
        seekTo={(request.frameTimeSec * 1000 + 1) / (file.metadata.length + 1)}
        className={classes.player}
        onReady={setPlayer}
      />
    </div>
  );
}

FindFrameRequestOverview.propTypes = {
  /**
   * Find-Frame Request to be displayed.
   */
  request: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default FindFrameRequestOverview;
