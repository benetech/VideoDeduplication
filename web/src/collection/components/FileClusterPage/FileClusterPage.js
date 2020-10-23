import React, { useCallback, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileActionHeader from "../FileActionsHeader";
import FileSummaryHeader from "../FileSummaryHeader";
import { useParams } from "react-router-dom";
import useFile from "../../hooks/useFile";
import FileLoadingHeader from "../FileLoadingHeader";
import { useDispatch, useSelector } from "react-redux";
import { selectFileMatches } from "../../state/selectors";
import { fetchFileMatches, updateFileMatchFilters } from "../../state/actions";
import MatchGraph from "../MatchGraph";
import { useIntl } from "react-intl";
import Loading from "./Loading";

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
  const { file, error, loadFile } = useFile(id);
  const matchesState = useSelector(selectFileMatches);
  const matches = matchesState.matches;
  const files = matchesState.files;
  const dispatch = useDispatch();
  const hasMore = !(matches.length >= matchesState.total);

  useEffect(() => {
    dispatch(updateFileMatchFilters(id, { hops: 2 }));
  }, [id]);

  useEffect(() => {
    if (
      matchesState.loading ||
      matchesState.error ||
      matches.length >= matchesState.total
    ) {
      return;
    }
    dispatch(fetchFileMatches());
  }, [matchesState]);

  const handleRetry = useCallback(() => {
    if (matchesState.total == null) {
      dispatch(updateFileMatchFilters(id, { hops: 2 }));
    } else {
      dispatch(fetchFileMatches());
    }
  }, [matchesState]);

  const handleLoadFile = useCallback(() => {
    loadFile();
    handleRetry();
  }, [handleRetry, loadFile]);

  if (file == null) {
    return (
      <div className={clsx(classes.root, className)}>
        <FileActionHeader id={id} />
        <FileLoadingHeader
          error={error}
          onRetry={handleLoadFile}
          className={classes.summaryHeader}
        />
      </div>
    );
  }

  let content;
  if (hasMore) {
    const progress =
      matchesState.total == null
        ? undefined
        : matches.length / matchesState.total;

    content = (
      <Loading
        error={matchesState.error}
        onRetry={handleRetry}
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
      <FileActionHeader id={id} matches={file.matchesCount} />
      <FileSummaryHeader file={file} className={classes.summaryHeader} />
      {content}
    </div>
  );
}

FileClusterPage.propTypes = {
  className: PropTypes.string,
};

export default FileClusterPage;
