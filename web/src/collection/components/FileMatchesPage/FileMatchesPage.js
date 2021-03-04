import React, { useCallback, useEffect, useState } from "react";
import lodash from "lodash";
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
import { useHistory, useParams } from "react-router-dom";
import useFile from "../../hooks/useFile";
import FileLoadingHeader from "../FileLoadingHeader";
import { useDispatch, useSelector } from "react-redux";
import { selectFileMatches } from "../../state/selectors";
import LoadTrigger from "../../../common/components/LoadingTrigger/LoadTrigger";
import { routes } from "../../../routing/routes";
import {
  fetchFileMatchesSlice,
  updateFileMatchesParams,
} from "../../state/fileMatches/actions";
import initialState from "../../state/fileMatches/initialState";

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
  trigger: {
    minHeight: 250,
  },
  match: {
    height: "100%",
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
    loadError: intl.formatMessage({ id: "match.load.error" }),
  };
}

function FileMatchesPage(props) {
  const { className } = props;
  const classes = useStyles();
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const { file, error, loadFile } = useFile(id);
  const messages = useMessages((file && file.matchesCount) || 0);
  const [view, setView] = useState(View.grid);
  const fileMatches = useSelector(selectFileMatches);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    const newParams = lodash.merge({}, initialState.params, {
      fileId: id,
      filters: { remote: true },
    });
    if (!lodash.isEqual(fileMatches.params, newParams)) {
      dispatch(updateFileMatchesParams(newParams));
      dispatch(fetchFileMatchesSlice());
    }
  }, [id, fileMatches]);

  const handleCompare = useCallback(
    () => history.push(routes.collection.fileComparisonURL(id)),
    [id]
  );

  const handleLoad = useCallback(() => dispatch(fetchFileMatchesSlice()), []);

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
          onCompare={handleCompare}
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
        <Grid container spacing={4} alignItems="stretch">
          {fileMatches.matches.map((match) => (
            <Grid item xs={6} lg={3} key={match.id}>
              <MatchPreview
                motherFile={file}
                matchFile={match.file}
                distance={match.distance}
                className={classes.match}
              />
            </Grid>
          ))}
          <Grid item xs={6} lg={3}>
            <LoadTrigger
              error={fileMatches.error}
              loading={fileMatches.loading || fileMatches.params.fileId == null}
              onLoad={handleLoad}
              hasMore={
                fileMatches.total == null ||
                fileMatches.matches.length < fileMatches.total ||
                fileMatches.params.fileId !== id
              }
              container={MatchPreview.Container}
              errorMessage={messages.loadError}
              className={classes.trigger}
            />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

FileMatchesPage.propTypes = {
  className: PropTypes.string,
};

export default FileMatchesPage;
