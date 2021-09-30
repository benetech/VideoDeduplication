import React, { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import FileBrowserActions from "./FileBrowserActions";
import FilterPane from "./FilterPane";
import SearchTextInput from "./SearchTextInput";
import CategorySelector from "./CategorySelector";
import useFilesColl from "../../application/api/files/useFilesColl";
import useFilesLazy from "../../application/api/files/useFilesLazy";
import FilesCollection from "./FilesCollection";

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    paddingTop: theme.dimensions.content.padding * 2,
    padding: theme.dimensions.content.padding,
    display: "flex",
    alignItems: "stretch",
    minWidth: theme.dimensions.collectionPage.width,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    position: "sticky",
    "@media screen and (min-height: 600px)": {
      top: 0,
      zIndex: 1,
      backgroundColor: theme.palette.background.default,
    },
  },
  actionsContainer: {
    display: "flex",
    alignItems: "center",
  },
  actions: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    minWidth: 400,
  },
  filters: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.spacing(2),
  },
  textSearch: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  categories: {
    marginTop: theme.spacing(2),
  },
  filterPane: {
    width: 270,
  },
}));

function FileBrowserPage(props: FileBrowserPageProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  const coll = useFilesColl();
  const query = useFilesLazy(coll.params);

  // Manage filters sidebar
  const activeFilters = FilterPane.useActiveFilters();
  const [showFilters, setShowFilters] = useState(false);
  const showFiltersRef = useRef<HTMLButtonElement>(null);
  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
    setTimeout(() => showFiltersRef.current?.focus());
  }, [showFilters, showFiltersRef]);

  // Handle query params
  const handleQuery = useCallback(
    (query) =>
      coll.updateParams({
        query,
      }),
    []
  );
  const updateCategory = useCallback(
    (matches) =>
      coll.updateParams({
        matches,
      }),
    []
  );
  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.content}>
        <div className={classes.header} role="search">
          <div className={classes.actionsContainer}>
            <FileBrowserActions
              showFilters={!showFilters}
              onToggleFilters={toggleFilters}
              showFiltersRef={showFiltersRef}
              activeFilters={activeFilters}
              className={classes.actions}
            />
          </div>
          <div className={classes.filters}>
            <SearchTextInput
              query={coll.params.query}
              onSearch={handleQuery}
              className={classes.textSearch}
            />
            <CategorySelector
              category={coll.params.matches}
              onChange={updateCategory}
              counts={query.counts}
              dense={showFilters}
              className={classes.categories}
            />
          </div>
        </div>
        <FilesCollection />
      </div>
      {showFilters && (
        <FilterPane
          onClose={toggleFilters}
          className={clsx(classes.filterPane)}
        />
      )}
    </div>
  );
}

type FileBrowserPageProps = {
  className?: string;
};
export default FileBrowserPage;
