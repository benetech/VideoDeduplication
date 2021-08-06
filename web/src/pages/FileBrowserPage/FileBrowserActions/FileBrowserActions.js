import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TuneIcon from "@material-ui/icons/Tune";
import AddMediaButton from "./AddMediaButton";
import ViewSelector from "./ViewSelector";
import SortSelector from "./SortSelector";
import SquaredIconButton from "../../../components/basic/SquaredIconButton";
import { useIntl } from "react-intl";
import { FileSort } from "../../../application/state/files/queries/FileSort";
import { Badge } from "@material-ui/core";
import FileListType from "../../../application/state/files/coll/FileListType";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Tooltip from "@material-ui/core/Tooltip";
import useFilesColl from "../../../application/api/files/useFilesColl";
import { useShowProcessing } from "../../../routing/hooks";

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
  label: {
    flexShrink: 1,
    minWidth: 0,
    ...theme.mixins.navlink,
    ...theme.mixins.textEllipsis,
    color: theme.palette.action.textInactive,
  },
  switch: {
    flexGrow: 0,
    justifyContent: "flex-end",
  },
  spacer: {
    flexGrow: 1,
  },
}));

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    blurDescription: intl.formatMessage({ id: "aria.label.blurAll" }),
    blurAction: intl.formatMessage({ id: "actions.blurVideos" }),
    showFiltersLabel: intl.formatMessage({ id: "actions.showFiltersPane" }),
  };
}

const FileBrowserActions = React.forwardRef(function FingerprintViewActions(
  props,
  ref
) {
  const {
    showFilters = true,
    onToggleFilters,
    showFiltersControls,
    showFiltersRef,
    activeFilters,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages();
  const coll = useFilesColl();
  const showProcessing = useShowProcessing();

  const updateBlur = useCallback(() => coll.setBlur(!coll.blur), [coll.blur]);
  const updateSort = useCallback((sort) => coll.updateParams({ sort }));

  return (
    <div className={clsx(classes.actions, className)} ref={ref} {...other}>
      <Tooltip title={messages.blurDescription} enterDelay={500}>
        <FormControlLabel
          className={classes.switch}
          control={
            <Switch
              checked={coll.blur}
              onChange={updateBlur}
              color="primary"
              inputProps={{ "aria-label": messages.blurDescription }}
            />
          }
          labelPlacement="start"
          label={<div className={classes.label}>{messages.blurAction}</div>}
        />
      </Tooltip>
      <div className={classes.spacer} />
      <AddMediaButton
        onClick={showProcessing}
        variant="contained"
        color="primary"
        className={classes.action}
      />
      <SortSelector
        value={coll.params.sort}
        onChange={updateSort}
        className={classes.action}
      />
      <ViewSelector
        view={coll.listType}
        className={classes.action}
        onChange={coll.setListType}
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
            aria-label={messages.showFiltersLabel}
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
  /**
   * Controls the global blur setting.
   */
  blur: PropTypes.bool,
  /**
   * Fires when video preview blurring is globally enabled/disabled.
   */
  onBlurChange: PropTypes.func,
  className: PropTypes.string,
};

export default FileBrowserActions;
