import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileActionHeader from "../../components/files/FileActionsHeader";
import FileSummaryHeader from "../../components/files/FileSummaryHeader";
import { useParams } from "react-router-dom";
import useFile from "../../application/api/files/useFile";
import FileLoadingHeader from "../../components/files/FileLoadingHeader";
import MatchGraph from "../../components/matches/MatchGraph";
import { useIntl } from "react-intl";
import Loading from "../../components/basic/Loading";
import useFileCluster from "../../application/api/file-cluster/useFileCluster";
import { useShowCollection } from "../../routing/hooks";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 2,
    minWidth: theme.dimensions.collectionPage.width,
  },
  summaryHeader: {
    margin: theme.spacing(2),
  },
  graph: {
    margin: theme.spacing(4),
  },
  loading: {
    minHeight: 500,
  },
}));

/**
 * Get i18n text
 */
function useMessages() {
  const intl = useIntl();
  return {
    loadError: intl.formatMessage({ id: "match.load.error" }),
  };
}

function FileClusterPage(props) {
  const { className } = props;
  const classes = useStyles();
  const { id } = useParams();
  const messages = useMessages();
  const showCollection = useShowCollection();
  const { file, error, refetch: loadFile } = useFile(id);

  const {
    matches,
    files,
    error: matchError,
    resumeLoading: loadCluster,
    hasMore,
    total,
  } = useFileCluster({ fileId: id, filters: { hops: 2 } });

  const handleLoadFile = useCallback(() => {
    loadFile();
    loadCluster();
  }, [loadCluster, loadFile]);

  if (file == null) {
    return (
      <div className={clsx(classes.root, className)}>
        <FileActionHeader id={id} />
        <FileLoadingHeader
          error={error}
          onRetry={handleLoadFile}
          onBack={showCollection}
          className={classes.summaryHeader}
        />
      </div>
    );
  }

  let content;
  if (hasMore) {
    const progress = total == null ? undefined : matches.length / total;
    content = (
      <Loading
        error={matchError}
        onRetry={loadCluster}
        progress={progress}
        errorMessage={messages.loadError}
        className={classes.loading}
      />
    );
  } else {
    content = (
      <MatchGraph
        source={file}
        matches={matches}
        files={files}
        className={classes.graph}
      />
    );
  }

  return (
    <div className={clsx(classes.root, className)}>
      <FileActionHeader
        id={id}
        matches={file.matchesCount}
        remote={file?.external}
      />
      <FileSummaryHeader
        file={file}
        onBack={showCollection}
        className={classes.summaryHeader}
      />
      {content}
    </div>
  );
}

FileClusterPage.propTypes = {
  className: PropTypes.string,
};

export default FileClusterPage;
