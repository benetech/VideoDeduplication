import React, { useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import View from "./view";
import FileMatchesActions from "./FileMatchesActions";
import FileActionHeader from "../FileActionsHeader";
import FileSummaryHeader from "../FileSummaryHeader";
import SectionSeparator from "./SectionSeparator";
import { useIntl } from "react-intl";
import Grid from "@material-ui/core/Grid";
import MatchPreview from "./MatchPreview";
import SquaredIconButton from "../../../common/components/SquaredIconButton";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import TuneOutlinedIcon from "@material-ui/icons/TuneOutlined";
import { useParams } from "react-router-dom";
import useFile from "../../hooks/useFile";
import FileLoadingHeader from "../FileLoadingHeader";
import { useDispatch, useSelector } from "react-redux";
import { selectFileMatches } from "../../state/selectors";
import { updateFileMatchFilters } from "../../state/actions";

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
  separator: {
    marginTop: theme.spacing(4),
  },
  matches: {
    margin: theme.spacing(2),
  },
  actionButton: {
    margin: theme.spacing(1.5),
  },
}));

/**
 * Get i18n text
 */
function useMessages(matchesCount) {
  const intl = useIntl();
  const matches = String(matchesCount).padStart(2, "0");
  return {
    matched: intl.formatMessage({ id: "file.matched" }, { count: matches }),
    showFilters: intl.formatMessage({ id: "actions.showFiltersPane" }),
    searchMatches: intl.formatMessage({ id: "actions.searchMatches" }),
  };
}

function isIncident(id) {
  return (match) => match.source === id || match.target === id;
}

function getMatchedFile(match, files, id) {
  if (match.source === id) {
    return files[match.target];
  } else if (match.target === id) {
    return files[match.source];
  } else {
    throw Error(
      `Match ${JSON.stringify(match)} is not incident to file id ${id}`
    );
  }
}

function FileMatchesPage(props) {
  const { className } = props;
  const classes = useStyles();
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const { file, error, loadFile } = useFile(id);
  const messages = useMessages((file && file.matchesCount) || 0);
  const [view, setView] = useState(View.grid);
  const matchesState = useSelector(selectFileMatches);
  const matches = matchesState.matches.filter(isIncident(id));
  const files = matchesState.files;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateFileMatchFilters(id, { hops: 1 }));
  }, [id]);

  if (file == null) {
    return (
      <div className={clsx(classes.root, className)}>
        <FileActionHeader id={id}>
          <FileMatchesActions view={view} onViewChange={setView} disabled />
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
      <FileActionHeader id={id} matches={file.matchesCount}>
        <FileMatchesActions
          view={view}
          onViewChange={setView}
          onCompare={() => console.log("compare")}
        />
      </FileActionHeader>
      <FileSummaryHeader file={file} className={classes.summaryHeader} />
      <SectionSeparator title={messages.matched} className={classes.separator}>
        <SquaredIconButton
          variant="outlined"
          className={classes.actionButton}
          aria-label={messages.searchMatches}
        >
          <SearchOutlinedIcon color="secondary" />
        </SquaredIconButton>
        <SquaredIconButton
          variant="outlined"
          className={classes.actionButton}
          aria-label={messages.searchMatches}
        >
          <TuneOutlinedIcon color="secondary" />
        </SquaredIconButton>
      </SectionSeparator>
      <div
        role="region"
        aria-label={messages.matched}
        className={classes.matches}
      >
        <Grid container spacing={4}>
          {matches.map((match) => (
            <Grid item xs={6} lg={3} key={match.id}>
              <MatchPreview
                distance={match.distance}
                file={getMatchedFile(match, files, id)}
              />
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

FileMatchesPage.propTypes = {
  className: PropTypes.string,
};

export default FileMatchesPage;
