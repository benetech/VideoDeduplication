import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TuneIcon from "@material-ui/icons/Tune";
import AddMediaButton from "./AddMediaButton";
import ViewSelector from "./ViewSelector";
import SortSelector from "./SortSelector";
import SquaredIconButton from "../../../../common/components/SquaredIconButton";
import { useIntl } from "react-intl";
import { FileSort } from "../../../state/FileSort";
import { Badge } from "@material-ui/core";
import FileListType from "../../../state/FileListType";

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
    activeFilters,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <div className={clsx(classes.actions, className)} ref={ref} {...other}>
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
        <Badge badgeContent={activeFilters} color="primary">
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
        </Badge>
      )}
    </div>
  );
});

FileBrowserActions.propTypes = {
  onAddMedia: PropTypes.func,
  sort: PropTypes.oneOf([
    "",
    FileSort.date,
    FileSort.length,
    FileSort.related,
    FileSort.duplicates,
  ]),
  onSortChange: PropTypes.func,
  view: PropTypes.oneOf([FileListType.linear, FileListType.grid]),
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
  /**
   * Active filters count that should be displayed.
   */
  activeFilters: PropTypes.number,
  className: PropTypes.string,
};

export default FileBrowserActions;
