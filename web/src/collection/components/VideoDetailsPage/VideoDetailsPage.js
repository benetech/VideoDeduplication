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

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 2,
    minWidth: theme.dimensions.detailsPage.width,
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

const file = randomFile();
file.matches = [...randomMatches(3)];

function VideoDetailsPage(props) {
  const { className } = props;
  const messages = useMessages();
  const [player, setPlayer] = useState(null);
  const classes = useStyles();

  const handleJump = useCallback(seekTo(player, file), [player, file]);

  return (
    <div className={clsx(classes.root, className)}>
      <FileActionHeader file={file}>
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
