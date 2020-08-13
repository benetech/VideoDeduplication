import React, { useCallback, useEffect, useState } from "react";
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
  selectLoading,
} from "../../state/selectors";
import { fetchFiles, updateFilters } from "../../state";
import LoadTrigger from "./LoadTrigger";
import Fab from "@material-ui/core/Fab";
import Zoom from "@material-ui/core/Zoom";
import VisibilitySensor from "react-visibility-sensor";
import { scrollIntoView } from "../../../common/helpers/scroll";

const { useRef } = require("react");

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
    top: 0,
    zIndex: 1,
    backgroundColor: theme.palette.background.default,
  },
  actionsContainer: {
    display: "flex",
    alignItems: "center",
  },
  actions: {
    flexGrow: 1,
  },
  data: {
    marginTop: theme.spacing(1),
    margin: theme.spacing(2),
    transform: "translate(0%, 0px)",
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

function FingerprintsView(props) {
  const { className } = props;
  const classes = useStyles();
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("");
  const [view, setView] = useState(View.grid);
  const [category, setCategory] = useState(Category.all);
  const loading = useSelector(selectLoading);
  const files = useSelector(selectFiles);
  const counts = useSelector(selectCounts);
  const dispatch = useDispatch();
  const [top, setTop] = useState(true);
  const topRef = useRef(null);

  useEffect(() => {
    dispatch(updateFilters({ query: "" }));
  }, []);

  const fetchPage = useCallback(() => dispatch(fetchFiles()), []);

  const toggleFilters = useCallback(() => setShowFilters(!showFilters), [
    showFilters,
  ]);

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
              onSearch={console.log}
              className={classes.textSearch}
            />
            <SearchCategorySelector
              category={category}
              onChange={setCategory}
              className={classes.categories}
            />
          </div>
        </div>
        <FpLinearList className={classes.data}>
          {files.map((file) => (
            <FpLinearListItem file={file} button key={file.id} />
          ))}
          <LoadTrigger
            loading={loading}
            onLoad={fetchPage}
            hasMore={files.length < counts.total}
            showProgress
          />
          <div className={classes.fab}>
            <Zoom in={!top}>
              <Fab color="primary" onClick={scrollTop}>
                <ExpandLessIcon />
              </Fab>
            </Zoom>
          </div>
        </FpLinearList>
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
