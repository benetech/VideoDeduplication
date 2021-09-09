import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import View from "./view";
import FileMatchesActions from "./FileMatchesActions";
import FileActionHeader from "../../components/files/FileActionsHeader";
import FileSummaryHeader from "../../components/files/FileSummaryHeader";
import SectionSeparator from "./SectionSeparator";
import { useIntl } from "react-intl";
import Grid from "@material-ui/core/Grid";
import MatchPreview from "../../components/matches/MatchPreview";
import SquaredIconButton from "../../components/basic/SquaredIconButton";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import TuneOutlinedIcon from "@material-ui/icons/TuneOutlined";
import { useParams } from "react-router-dom";
import useFile from "../../application/api/files/useFile";
import FileLoadingHeader from "../../components/files/FileLoadingHeader";
import LoadTrigger from "../../components/basic/LoadingTrigger/LoadTrigger";
import FilterPanel from "./FilterPanel";
import { useCompareFiles, useShowCollection } from "../../routing/hooks";
import useFileMatchesLazy from "../../application/api/matches/useFileMatchesLazy";

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

function FileMatchesPage(props) {
  const { className } = props;
  const classes = useStyles();
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const { file, error, refetch } = useFile(id);
  const messages = useMessages((file && file.matchesCount) || 0);
  const [view, setView] = useState(View.grid);
  const [filters, setFilters] = useState({ remote: null, falsePositive: null });
  const [showFilters, setShowFilters] = useState(false);
  const query = useFileMatchesLazy(id, filters);
  const showCollection = useShowCollection();
  const handleCompare = useCompareFiles(id, [id]);

  const handleToggleFilters = useCallback(
    () => setShowFilters(!showFilters),
    [showFilters]
  );

  if (file == null) {
    return (
      <div className={clsx(classes.root, className)}>
        <FileActionHeader id={id}>
          <FileMatchesActions view={view} onViewChange={setView} disabled />
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
      <FileSummaryHeader
        file={file}
        onBack={showCollection}
        className={classes.summaryHeader}
      />
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
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          className={classes.filters}
        />
      )}
      <div
        role="region"
        aria-label={messages.matched}
        className={classes.matches}
      >
        <Grid container spacing={4} alignItems="stretch">
          {query.pages.map((page) =>
            page.map((match) => (
              <Grid item xs={6} lg={3} key={match.id}>
                <MatchPreview match={match} className={classes.match} />
              </Grid>
            ))
          )}
          <Grid item xs={6} lg={3}>
            <LoadTrigger
              error={query.error}
              loading={query.isLoading}
              onLoad={query.fetchNextPage}
              hasMore={query.hasNextPage}
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
