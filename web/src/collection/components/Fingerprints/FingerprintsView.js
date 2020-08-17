import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import FingerprintViewActions, { View } from "./FingerprintsViewActions";
import FilterPane from "./FilterPane";
import SearchTextInput from "./SearchTextInput";
import SearchCategorySelector, { Category } from "./SearchCategorySelector";
import FpLinearList from "./FPLinearList";
import FpLinearListItem from "./FPLinearListItem";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCounts,
  selectFiles,
  selectFilters,
  selectLoading,
} from "../../state/selectors";
import { fetchFiles, updateFilters } from "../../state";
import LoadTrigger from "./LoadTrigger";
import Fab from "@material-ui/core/Fab";
import Zoom from "@material-ui/core/Zoom";
import VisibilitySensor from "react-visibility-sensor";
import { scrollIntoView } from "../../../common/helpers/scroll";
import FpGridList from "./FPGridList";
import FpGridListItem from "./FPGridListItem";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.dimensions.content.padding * 2,
    padding: theme.dimensions.content.padding,
    display: "flex",
    alignItems: "stretch",
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
    minWidth: 250,
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

function viewComponents(view) {
  switch (view) {
    case View.list:
      return [FpLinearList, FpLinearListItem];
    case View.grid:
      return [FpGridList, FpGridListItem];
    default:
      throw new Error(`Unsupported fingerprints view type: ${view}`);
  }
}

function FingerprintsView(props) {
  const { className } = props;
  const classes = useStyles();
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("");
  const [view, setView] = useState(View.grid);
  const [category, setCategory] = useState(Category.all);
  const loading = useSelector(selectLoading);
  const files = useSelector(selectFiles);
  const filters = useSelector(selectFilters);
  const counts = useSelector(selectCounts);
  const dispatch = useDispatch();
  const [top, setTop] = useState(true);
  const topRef = useRef(null);
  const [List, ListItem] = viewComponents(view);

  useEffect(() => {
    dispatch(updateFilters({ query: "" }));
  }, []);

  const fetchPage = useCallback(() => dispatch(fetchFiles()), []);

  const toggleFilters = useCallback(() => setShowFilters(!showFilters), [
    showFilters,
  ]);

  const handleQuery = useCallback((query) => {
    dispatch(updateFilters({ query }));
  }, []);

  const scrollTop = useCallback(() => scrollIntoView(topRef), [topRef]);

  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.content}>
        <VisibilitySensor onChange={setTop} partialVisibility>
          <div className={classes.top} ref={topRef} />
        </VisibilitySensor>
        <div className={classes.header}>
          <div className={classes.actionsContainer}>
            <FingerprintViewActions
              sort={sort}
              onSortChange={setSort}
              view={view}
              onViewChange={setView}
              onAddMedia={() => console.log("On Add Media")}
              showFilters={!showFilters}
              onToggleFilters={toggleFilters}
              className={classes.actions}
            />
          </div>
          <div className={classes.filters}>
            <SearchTextInput
              query={filters.query}
              onSearch={handleQuery}
              className={classes.textSearch}
            />
            <SearchCategorySelector
              category={category}
              onChange={setCategory}
              className={classes.categories}
            />
          </div>
        </div>
        <div
          className={clsx(classes.dataContainer, {
            [classes.gridContainer]: view === View.grid,
          })}
        >
          <List
            className={clsx(classes.data, {
              [classes.grid]: view === View.grid,
              [classes.list]: view === View.list,
            })}
            dense={showFilters}
          >
            {files.map((file) => (
              <ListItem file={file} button key={file.id} dense={showFilters} />
            ))}
            <LoadTrigger
              loading={loading}
              onLoad={fetchPage}
              hasMore={files.length < counts.total}
              showProgress
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
      <FilterPane
        onClose={toggleFilters}
        className={clsx(classes.filterPane, { [classes.hidden]: !showFilters })}
      />
    </div>
  );
}

FingerprintsView.propTypes = {
  className: PropTypes.string,
};

export default FingerprintsView;
