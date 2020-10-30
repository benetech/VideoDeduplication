import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import LoadingHeader from "../LoadingHeader";
import FileDetails from "../FileDetails";
import useDirectMatches from "../../../hooks/useDirectMatches";
import FileMatchHeader from "./FileMatchHeader";
import MatchSelector from "./MatchSelector";

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
}));

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "file.match" }),
    loadError: intl.formatMessage({ id: "match.load.error" }),
  };
}

function MatchFiles(props) {
  const { motherFileId, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [selected, setSelected] = useState(0);

  const {
    file,
    matches,
    error: matchError,
    loadMatches,
    hasMore,
    progress,
  } = useDirectMatches(motherFileId);

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
  } else if (matches.length > 0) {
    content = (
      <div>
        <FileMatchHeader
          distance={matches[selected].distance}
          file={matches[selected].file}
          className={classes.fileHeader}
        />
        <FileDetails file={matches[selected].file} />
      </div>
    );
  } else {
    content = null;
  }

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{messages.title}</div>
        {!hasMore && (
          <MatchSelector
            matches={matches}
            selected={selected}
            onChange={setSelected}
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
  className: PropTypes.string,
};

export default MatchFiles;
