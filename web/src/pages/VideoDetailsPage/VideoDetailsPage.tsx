import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import Button from "../../components/basic/Button";
import Grid from "@material-ui/core/Grid";
import SearchIcon from "@material-ui/icons/Search";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import AddIcon from "@material-ui/icons/Add";
import VideoPlayerPane from "./VideoPlayerPane";
import VideoInformationPane from "./VideoInformationPane";
import { seekToObject } from "./seekTo";
import FileSummaryHeader from "../../components/files/FileSummaryHeader";
import FileActionHeader from "../../components/files/FileActionsHeader";
import { useParams } from "react-router-dom";
import FileLoadingHeader from "../../components/files/FileLoadingHeader";
import useFile from "../../application/api/files/useFile";
import {
  useCompareFiles,
  useShowCollection,
  useShowMatches,
} from "../../routing/hooks";
import useSearchFrame from "../../application/api/templates/useSearchFrame";
import VideoPlayerActions from "../../components/files/VideoPlayerActions";
import VideoPlayerAction from "../../components/files/VideoPlayerAction";
import useAddFrameDialog from "./useAddFrameDialog";
import useObjectsAll from "../../application/api/objects/useObjectsAll";
import useTemplatesAll from "../../application/api/templates/useTemplatesAll";
import { VideoPlayerAPI } from "../../components/files/VideoPlayer/VideoPlayerAPI";
import { EntityPageURLParams } from "../../routing/routes";

const useStyles = makeStyles<Theme>((theme) => ({
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
    compare: intl.formatMessage({
      id: "actions.compare",
    }),
    findFrame: intl.formatMessage({
      id: "actions.findFrame",
    }),
    nextFrame: intl.formatMessage({
      id: "actions.nextFrame",
    }),
    prevFrame: intl.formatMessage({
      id: "actions.prevFrame",
    }),
    addFrame: intl.formatMessage({
      id: "actions.addFrameToTemplate",
    }),
  };
}

function VideoDetailsPage(props: VideoDetailsPageProps): JSX.Element {
  const { className } = props;
  const { id: rawId } = useParams<EntityPageURLParams>();
  const id = Number(rawId);
  const messages = useMessages();
  const { file, error, refetch } = useFile(id);
  const [player, setPlayer] = useState<VideoPlayerAPI | null>(null);
  const classes = useStyles();
  const showCollection = useShowCollection();
  const showMatches = useShowMatches();
  const compareFiles = useCompareFiles();
  const handleCompare = useCallback(() => compareFiles(id), [id]);
  const handleShowMatches = useCallback(() => showMatches(id), [id]); // Preload file objects and templates

  const { done: objectsLoaded } = useObjectsAll({
    fileId: id,
  });
  const { done: templatesLoaded } = useTemplatesAll(); // There is nothing to show for external files.
  // Navigate to file matches if file is external.

  useEffect(() => {
    if (file?.external) {
      handleShowMatches();
    }
  }, [file]);
  const handleJump = useCallback(seekToObject(player, file), [player, file]);
  const searchFrame = useSearchFrame();
  const handleSearchFrame = useCallback(() => {
    const time = (player?.currentTime || 0) * 1000;

    if (file != null && time != null) {
      searchFrame({
        file,
        time,
      });
    }
  }, [player, file]);
  const showNextFrame = useCallback(() => player?.stepForward(), [player]);
  const showPrevFrame = useCallback(() => player?.stepBack(), [player]);
  const [addFrame, addFrameDialog] = useAddFrameDialog();
  const handleAddFrame = useCallback(() => {
    if (player != null && file != null) {
      addFrame(file, (player?.currentTime || 0) * 1000);
    }
  }, [player, file, addFrame]);

  if (file == null || !objectsLoaded || !templatesLoaded) {
    return (
      <div className={clsx(classes.root, className)}>
        <FileActionHeader id={id}>
          <Button color="primary" variant="contained" disabled>
            {messages.compare}
          </Button>
        </FileActionHeader>
        <FileLoadingHeader
          error={error}
          onRetry={refetch}
          onBack={showCollection}
          className={classes.summaryHeader}
        />
      </div>
    );
  }

  return (
    <div className={clsx(classes.root, className)}>
      <FileActionHeader id={file.id} matches={file.relatedCount}>
        <Button color="primary" variant="contained" onClick={handleCompare}>
          {messages.compare}
        </Button>
      </FileActionHeader>
      <FileSummaryHeader
        file={file}
        onBack={showCollection}
        className={classes.summaryHeader}
      />
      <div className={classes.dataContainer}>
        <Grid container spacing={5}>
          <Grid item xs={12} lg={6}>
            <VideoPlayerPane
              file={file}
              onPlayerReady={setPlayer}
              playerActions={
                <VideoPlayerActions>
                  <VideoPlayerAction
                    icon={ChevronLeftIcon}
                    handler={showPrevFrame}
                    tooltip={messages.prevFrame}
                  />
                  <VideoPlayerAction
                    icon={SearchIcon}
                    handler={handleSearchFrame}
                    title={messages.findFrame}
                  />
                  <VideoPlayerAction
                    icon={AddIcon}
                    handler={handleAddFrame}
                    tooltip={messages.addFrame}
                  />
                  <VideoPlayerAction
                    icon={ChevronRightIcon}
                    handler={showNextFrame}
                    tooltip={messages.nextFrame}
                  />
                </VideoPlayerActions>
              }
            />
          </Grid>
          <Grid item xs={12} lg={6}>
            <VideoInformationPane file={file} onJump={handleJump} />
          </Grid>
        </Grid>
      </div>
      {addFrameDialog}
    </div>
  );
}

type VideoDetailsPageProps = {
  className?: string;
};
export default VideoDetailsPage;
