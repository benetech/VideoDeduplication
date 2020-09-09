import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TuneIcon from "@material-ui/icons/Tune";
import AddMediaButton from "./AddMediaButton";
import ViewSelector from "./ViewSelector";
import SortSelector from "./SortSelector";
import { Sort } from "./sort";
import { View } from "./view";
import SquaredIconButton from "../../../../common/components/SquaredIconButton";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  action: {
    marginLeft: theme.spacing(2),
  },
}));

const FileBrowserActions = React.forwardRef(function FingerprintViewActions(
  props,
  ref
) {
  const {
    onAddMedia,
    view,
    onViewChange,
    sort,
    onSortChange,
    showFilters = true,
    onToggleFilters,
    showFiltersControls,
    showFiltersRef,
    className,
  } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <div className={clsx(classes.actions, className)} ref={ref}>
      <AddMediaButton
        onClick={onAddMedia}
        variant="contained"
        color="primary"
        className={classes.action}
      />
      <SortSelector
        value={sort}
        onChange={onSortChange}
        className={classes.action}
      />
      <ViewSelector
        view={view}
        className={classes.action}
        onChange={onViewChange}
      />
      {showFilters && (
        <SquaredIconButton
          variant="outlined"
          color="secondary"
          ref={showFiltersRef}
          onClick={onToggleFilters}
          className={classes.action}
          aria-controls={showFiltersControls}
          aria-label={intl.formatMessage({ id: "actions.showFiltersPane" })}
        >
          <TuneIcon />
        </SquaredIconButton>
      )}
    </div>
  );
});

FileBrowserActions.propTypes = {
  onAddMedia: PropTypes.func,
  sort: PropTypes.oneOf(["", Sort.size, Sort.date, Sort.duration]),
  onSortChange: PropTypes.func,
  view: PropTypes.oneOf([View.list, View.grid]),
  /**
   * Callback for switching List or Grid view
   */
  onViewChange: PropTypes.func,
  showFilters: PropTypes.bool,
  onToggleFilters: PropTypes.func,
  /**
   * Id of the filters pane element
   */
  showFiltersControls: PropTypes.string,
  /**
   * Reference to show filter button
   */
  showFiltersRef: PropTypes.any,
  className: PropTypes.string,
};

export default FileBrowserActions;
