import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FingerprintViewActions, { View } from "./FingerprintsViewActions";
import FilterPane from "./FilterPane";
import SearchTextInput from "./SearchTextInput";
import SearchCategorySelector, { Category } from "./SearchCategorySelector";
import FpLinearList from "./FPLinearList";
import FpLinearListItem from "./FPLinearListItem";

const { useState } = require("react");

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.dimensions.content.padding * 2,
    padding: theme.dimensions.content.padding,
    display: "flex",
    alignItems: "stretch",
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  actions: {
    flexGrow: 1,
  },
  data: {
    marginTop: theme.spacing(1),
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
}));

function FingerprintsView(props) {
  const { className } = props;
  const classes = useStyles();
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("");
  const [view, setView] = useState(View.grid);
  const [category, setCategory] = useState(Category.all);

  const toggleFilters = useCallback(() => setShowFilters(!showFilters), [
    showFilters,
  ]);

  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.content}>
        <div className={classes.header}>
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
        <FpLinearList className={classes.data}>
          <FpLinearListItem button />
          <FpLinearListItem button />
          <FpLinearListItem button />
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
