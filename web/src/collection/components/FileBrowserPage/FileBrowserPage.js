import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import FileBrowserActions from "./FileBrowserActions";
import FilterPane from "./FilterPane";
import SearchTextInput from "./SearchTextInput";
import CategorySelector from "./CategorySelector";
import FileLinearList from "./FileLinearList/FileLinearList";
import FileGridList from "./FileGridList";
import { useDispatch, useSelector } from "react-redux";
import {
  selectFileCounts,
  selectFileError,
  selectFileFilters,
  selectFileList,
  selectFileLoading,
  selectFiles,
} from "../../state/selectors";
import Fab from "@material-ui/core/Fab";
import Zoom from "@material-ui/core/Zoom";
import VisibilitySensor from "react-visibility-sensor";
import { scrollIntoView } from "../../../common/helpers/scroll";
import { useHistory } from "react-router-dom";
import { routes } from "../../../routing/routes";
import { useIntl } from "react-intl";
import FileListType from "../../state/fileList/FileListType";
import {
  blurFiles,
  changeFileListView,
  fetchFiles,
  updateFilters,
} from "../../state/fileList/actions";
import { defaultFilters } from "../../state/fileList/initialState";

const useStyles = makeStyles((theme) => ({
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
  dataContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  gridContainer: {
    padding: theme.spacing(2),
  },
  data: {
    marginTop: theme.spacing(1),
    transform: "translate(0%, 0px)",
  },
  grid: {
    overflow: "hidden",
  },
  list: {
    margin: theme.spacing(2),
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
  hidden: {
    display: "none",
  },
  fab: {
    position: "sticky",
    bottom: theme.spacing(5),
    margin: theme.spacing(5),
    display: "flex",
    justifyContent: "flex-end",
  },
  top: {
    width: "100%",
    height: 1,
  },
}));

function listComponent(view) {
  switch (view) {
    case FileListType.linear:
      return FileLinearList;
    case FileListType.grid:
      return FileGridList;
    default:
      throw new Error(`Unsupported fingerprints view type: ${view}`);
  }
}

function FileBrowserPage(props) {
  const { className } = props;
  const classes = useStyles();
  const [showFilters, setShowFilters] = useState(false);
  const fileListState = useSelector(selectFileList);
  const error = useSelector(selectFileError);
  const loading = useSelector(selectFileLoading);
  const files = useSelector(selectFiles);
  const filters = useSelector(selectFileFilters);
  const counts = useSelector(selectFileCounts);
  const dispatch = useDispatch();
  const [top, setTop] = useState(true);
  const topRef = useRef(null);
  const history = useHistory();
  const view = fileListState.fileListType;
  const blur = fileListState.blur;
  const List = listComponent(view);
  const intl = useIntl();
  const showFiltersRef = useRef();
  const activeFilters = FilterPane.useActiveFilters();

  useEffect(() => {
    if (fileListState.neverLoaded) {
      dispatch(updateFilters(defaultFilters));
    }
  }, [fileListState.neverLoaded]);

  const handleFetchPage = useCallback(() => dispatch(fetchFiles()), []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
    setTimeout(() => showFiltersRef.current?.focus());
  }, [showFilters, showFiltersRef]);

  const handleQuery = useCallback((query) => {
    dispatch(updateFilters({ query }));
  }, []);

  const handleClickVideo = useCallback(
    (file) => history.push(routes.collection.fileURL(file.id)),
    []
  );

  const handleChangeCategory = useCallback(
    (matches) => dispatch(updateFilters({ ...filters, matches })),
    [filters]
  );

  const handleChangeSort = useCallback(
    (sort) => dispatch(updateFilters({ ...filters, sort })),
    [filters]
  );

  const handleChangeView = useCallback(
    (view) => dispatch(changeFileListView(view)),
    []
  );

  const handleChangeBlur = useCallback((blur) => dispatch(blurFiles(blur)), []);

  const scrollTop = useCallback(() => scrollIntoView(topRef), [topRef]);

  const handleAddMedia = useCallback(
    () => history.push(routes.processing.home),
    [history]
  );

  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.content}>
        <VisibilitySensor onChange={setTop} partialVisibility>
          <div className={classes.top} ref={topRef} />
        </VisibilitySensor>
        <div className={classes.header} role="search">
          <div className={classes.actionsContainer}>
            <FileBrowserActions
              sort={filters.sort}
              onSortChange={handleChangeSort}
              view={view}
              onViewChange={handleChangeView}
              onAddMedia={handleAddMedia}
              showFilters={!showFilters}
              onToggleFilters={handleToggleFilters}
              className={classes.actions}
              showFiltersRef={showFiltersRef}
              activeFilters={activeFilters}
              blur={blur}
              onBlurChange={handleChangeBlur}
            />
          </div>
          <div className={classes.filters}>
            <SearchTextInput
              query={filters.query}
              onSearch={handleQuery}
              className={classes.textSearch}
            />
            <CategorySelector
              category={filters.matches}
              onChange={handleChangeCategory}
              counts={counts}
              dense={showFilters}
              className={classes.categories}
            />
          </div>
        </div>
        <div
          className={clsx(classes.dataContainer, {
            [classes.gridContainer]: view === FileListType.grid,
          })}
        >
          <List
            className={clsx(classes.data, {
              [classes.grid]: view === FileListType.grid,
              [classes.list]: view === FileListType.linear,
            })}
            dense={showFilters}
          >
            {files.map((file) => (
              <List.Item
                file={file}
                button
                key={file.id}
                blur={blur}
                dense={showFilters}
                highlight={filters.query}
                onClick={handleClickVideo}
              />
            ))}
            <List.LoadTrigger
              error={error}
              loading={loading}
              onLoad={handleFetchPage}
              dense={showFilters}
              hasMore={error || files.length < counts[filters.matches]}
            />
          </List>
          <div className={classes.fab}>
            <Zoom in={!top}>
              <Fab color="primary" onClick={scrollTop}>
                <ExpandLessIcon />
              </Fab>
            </Zoom>
          </div>
        </div>
      </div>
      {showFilters && (
        <FilterPane
          onClose={handleToggleFilters}
          className={clsx(classes.filterPane)}
          aria-label={intl.formatMessage({ id: "aria.label.filterPane" })}
          role="search"
        />
      )}
    </div>
  );
}

FileBrowserPage.propTypes = {
  className: PropTypes.string,
};

export default FileBrowserPage;
