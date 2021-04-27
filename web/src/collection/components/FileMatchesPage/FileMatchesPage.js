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
import FilterPanel from "./FilterPanel";

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
  filters: {
    margin: theme.spacing(1),
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

/**
 * Create match predicate from filters.
 */
function asPredicate(filters) {
  const { falsePositive } = filters;
  return (match) =>
    falsePositive == null || match.falsePositive === falsePositive;
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
  const filters = fileMatches.params.filters;
  const [showFilters, setShowFilters] = useState(false);

  const handleToggleFilters = useCallback(() => setShowFilters(!showFilters), [
    showFilters,
  ]);

  useEffect(() => {
    const newParams = lodash.merge({}, fileMatches.params, {
      fileId: id,
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
      <FileActionHeader
        id={id}
        matches={file.matchesCount}
        remote={file?.external}
      >
        <FileMatchesActions
          view={view}
          onViewChange={setView}
          onCompare={handleCompare}
          remote={file?.external}
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
          onClick={handleToggleFilters}
        >
          <TuneOutlinedIcon color="secondary" />
        </SquaredIconButton>
      </SectionSeparator>
      {showFilters && <FilterPanel className={classes.filters} />}
      <div
        role="region"
        aria-label={messages.matched}
        className={classes.matches}
      >
        <Grid container spacing={4} alignItems="stretch">
          {fileMatches.matches.filter(asPredicate(filters)).map((match) => (
            <Grid item xs={6} lg={3} key={match.id}>
              <MatchPreview
                motherFile={file}
                match={match}
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
