import React, { useCallback, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import LoadingHeader from "../LoadingHeader";
import FileDetails from "../FileDetails";
import FileMatchHeader from "./FileMatchHeader";
import MatchSelector from "./MatchSelector";
import useFileMatches from "../../../hooks/useFileMatches";

const useStyles = makeStyles((theme) => ({
  root: {},
  header: {
    height: theme.spacing(10),
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    flexGrow: 1,
  },
  loading: {
    margin: theme.spacing(2),
  },
  fileHeader: {
    marginTop: 0,
    margin: theme.spacing(2),
  },
  errorMessage: {
    minHeight: 150,
    ...theme.mixins.title2,
    color: theme.palette.action.textInactive,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

/**
 * Compare two matches.
 */
function matchComparator(first, second) {
  if (first.distance < second.distance) {
    return -1;
  } else if (first.distance > second.distance) {
    return 1;
  } else {
    return String(first.file.filename).localeCompare(second.file.filename);
  }
}

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "file.match" }),
    loadError: intl.formatMessage({ id: "match.load.error" }),
    notMatch: intl.formatMessage({ id: "match.notMatch" }),
    noMatches: intl.formatMessage({ id: "match.noMatches" }),
  };
}

function MatchFiles(props) {
  const {
    motherFileId,
    matchFileId,
    onMatchFileChange,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages();

  const {
    matches: loadedMatches,
    error: matchError,
    resumeLoading: loadMatches,
    hasMore,
    progress,
  } = useFileMatches({ fileId: motherFileId });

  const matches = loadedMatches.sort(matchComparator);

  // Move to the first element when matches are loaded
  useEffect(() => {
    if (!hasMore && matches.length > 0 && matchFileId == null) {
      onMatchFileChange(matches[0].file.id);
    }
  }, [hasMore, onMatchFileChange, motherFileId]);

  // Get index of the selected match file
  const selected = matches.findIndex((match) => match.file.id === matchFileId);

  const handleSelectionChange = useCallback(
    (index) => {
      onMatchFileChange(matches[index].file.id);
    },
    [hasMore, onMatchFileChange, motherFileId]
  );

  let content;
  if (hasMore) {
    content = (
      <LoadingHeader
        onRetry={loadMatches}
        errorMessage={messages.loadError}
        error={matchError}
        className={classes.loading}
        progress={progress}
      />
    );
  } else if (matches.length > 0 && selected >= 0) {
    content = (
      <div>
        <FileMatchHeader
          distance={matches[selected].distance}
          file={matches[selected].file}
          className={classes.fileHeader}
          data-selector="MatchHeader"
        />
        <FileDetails file={matches[selected].file} />
      </div>
    );
  } else {
    const errorMessage =
      matches.length === 0 ? messages.noMatches : messages.notMatch;
    content = <div className={classes.errorMessage}>{errorMessage}</div>;
  }

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{messages.title}</div>
        {!hasMore && (
          <MatchSelector
            matches={matches}
            selected={selected}
            onChange={handleSelectionChange}
          />
        )}
      </div>
      {content}
    </div>
  );
}

MatchFiles.propTypes = {
  /**
   * Mother file id.
   */
  motherFileId: PropTypes.number.isRequired,
  /**
   * Match file id.
   */
  matchFileId: PropTypes.number,
  /**
   * Handle match file change.
   */
  onMatchFileChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default MatchFiles;
