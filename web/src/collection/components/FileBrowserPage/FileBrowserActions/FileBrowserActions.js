import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TuneIcon from "@material-ui/icons/Tune";
import AddMediaButton from "./AddMediaButton";
import ViewSelector from "./ViewSelector";
import SortSelector from "./SortSelector";
import SquaredIconButton from "../../../../common/components/SquaredIconButton";
import { useIntl } from "react-intl";
import { FileSort } from "../../../state/fileList/FileSort";
import { Badge } from "@material-ui/core";
import FileListType from "../../../state/fileList/FileListType";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Tooltip from "@material-ui/core/Tooltip";

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
    flexGrow: 1,
    justifyContent: "flex-end",
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
    blur,
    onBlurChange,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages();

  const handleBlurChange = useCallback(() => onBlurChange(!blur), [blur]);

  return (
    <div className={clsx(classes.actions, className)} ref={ref} {...other}>
      <Tooltip title={messages.blurDescription} enterDelay={500}>
        <FormControlLabel
          className={classes.switch}
          control={
            <Switch
              checked={blur}
              onChange={handleBlurChange}
              color="primary"
              inputProps={{ "aria-label": messages.blurDescription }}
            />
          }
          labelPlacement="start"
          label={<div className={classes.label}>{messages.blurAction}</div>}
        />
      </Tooltip>
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
