import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import Button from "../../../common/components/Button";
import Grid from "@material-ui/core/Grid";
import VideoPlayerPane from "./VideoPlayerPane";
import VideoInformationPane from "./VideoInformationPane";
import {
  randomFile,
  randomMatches,
} from "../../../server-api/MockServer/fake-data/files";
import { seekTo } from "./seekTo";
import FileSummaryHeader from "../FileSummaryHeader";
import FileActionHeader from "../FileActionsHeader";
import { useParams } from "react-router-dom";
import FileLoadingHeader from "../FileLoadingHeader";
import useFile from "../../hooks/useFile";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 2,
    minWidth: theme.dimensions.collectionPage.width,
  },
  actionsHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  navTabs: {
    width: 450,
  },
  actions: {
    marginLeft: theme.spacing(4),
    flexGrow: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  summaryHeader: {
    margin: theme.spacing(2),
  },
  dataContainer: {
    padding: theme.spacing(2),
  },
  loadingRoot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
  },
}));

/**
 * Get i18n messages
 */
function useMessages() {
  const intl = useIntl();
  return {
    compare: intl.formatMessage({ id: "actions.compare" }),
  };
}

function VideoDetailsPage(props) {
  const { className } = props;
  const { id } = useParams();
  const messages = useMessages();
  const { file, error, loadFile } = useFile(id);
  const [player, setPlayer] = useState(null);
  const classes = useStyles();

  const handleJump = useCallback(seekTo(player, file), [player, file]);

  if (file == null) {
    return (
      <div className={clsx(classes.root, className)}>
        <FileActionHeader id={id}>
          <Button color="primary" variant="contained" disabled>
            {messages.compare}
          </Button>
        </FileActionHeader>
        <FileLoadingHeader
          error={error}
          onRetry={loadFile}
          className={classes.summaryHeader}
        />
      </div>
    );
  }

  return (
    <div className={clsx(classes.root, className)}>
      <FileActionHeader id={file.id} matches={file.matchesCount}>
        <Button color="primary" variant="contained">
          {messages.compare}
        </Button>
      </FileActionHeader>
      <FileSummaryHeader file={file} className={classes.summaryHeader} />
      <div className={classes.dataContainer}>
        <Grid container spacing={5}>
          <Grid item xs={12} lg={6}>
            <VideoPlayerPane file={file} onPlayerReady={setPlayer} />
          </Grid>
          <Grid item xs={12} lg={6}>
            <VideoInformationPane file={file} onJump={handleJump} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

VideoDetailsPage.propTypes = {
  className: PropTypes.string,
};

export default VideoDetailsPage;
