import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import Button from "../../../common/components/Button";
import Grid from "@material-ui/core/Grid";
import VideoPlayerPane from "./VideoPlayerPane";
import VideoInformationPane from "./VideoInformationPane";
import { seekTo } from "./seekTo";
import FileSummaryHeader from "../FileSummaryHeader";
import FileActionHeader from "../FileActionsHeader";
import { useHistory, useParams } from "react-router-dom";
import FileLoadingHeader from "../FileLoadingHeader";
import useFile from "../../hooks/useFile";
import { routes } from "../../../routing/routes";
import ObjectAPI from "../../../application/objects/ObjectAPI";
import { updateTask } from "../../state/tasks/actions";
import { useServer } from "../../../server-api/context";
import { useDispatch } from "react-redux";

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

/**
 * Handle search frame request.
 */
function useSearchFrame() {
  const server = useServer();
  const history = useHistory();
  const dispatch = useDispatch();

  return useCallback(({ file, time }) => {
    server
      .createTask({
        request: { type: "FindFrame", file_id: file.id, frame_time_sec: time },
      })
      .then((response) => {
        if (response.success) {
          dispatch(updateTask(response.data));
          history.push(routes.processing.taskURL(response.data.id));
        }
      })
      .catch((error) => {
        console.error("Find frame request failed", error, {
          error,
          file,
          time,
        });
      });
  });
}

function VideoDetailsPage(props) {
  const { className } = props;
  const { id } = useParams();
  const messages = useMessages();
  const { file, error, loadFile } = useFile(id);
  const [player, setPlayer] = useState(null);
  const classes = useStyles();
  const history = useHistory();

  // Preload file objects
  const objectsAPI = ObjectAPI.use();
  const { done: objectsLoaded } = objectsAPI.useFileObjects(id);

  // There is nothing to show for external files.
  // Navigate to file matches if file is external.
  useEffect(() => {
    if (file?.external) {
      history.replace(routes.collection.fileMatchesURL(file.id));
    }
  }, [file]);

  const handleCompare = useCallback(
    () => history.push(routes.collection.fileComparisonURL(id)),
    [id]
  );

  const handleJump = useCallback(seekTo(player, file), [player, file]);
  const searchFrame = useSearchFrame();

  if (file == null || !objectsLoaded) {
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
        <Button color="primary" variant="contained" onClick={handleCompare}>
          {messages.compare}
        </Button>
      </FileActionHeader>
      <FileSummaryHeader file={file} className={classes.summaryHeader} />
      <div className={classes.dataContainer}>
        <Grid container spacing={5}>
          <Grid item xs={12} lg={6}>
            <VideoPlayerPane
              file={file}
              onPlayerReady={setPlayer}
              onSearchFrame={searchFrame}
            />
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
