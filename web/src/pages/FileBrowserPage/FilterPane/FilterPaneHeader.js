import React, { useCallback, useEffect, useRef, useState } from "react";
import lodash from "lodash";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TuneIcon from "@material-ui/icons/Tune";
import IconButton from "@material-ui/core/IconButton";
import SaveOutlinedIcon from "@material-ui/icons/SaveOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import SquaredIconButton from "../../../components/basic/SquaredIconButton";
import { useIntl } from "react-intl";
import { Tooltip } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { selectFileFilters } from "../../../application/state/root/selectors";
import PresetAPI from "./PresetAPI";
import AddPresetDialog from "./AddPresetDialog";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
import { updateFilters } from "../../../application/state/files/fileList/actions";
import filesInitialState from "../../../application/state/files/fileList/initialState";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    borderBottom: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#D8D8D8",
    padding: theme.spacing(2),
  },
  toggleButton: {},
  title: {
    ...theme.mixins.title3,
    flexGrow: 1,
    marginLeft: theme.spacing(2),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "filter.title" }),
    hideLabel: intl.formatMessage({ id: "actions.hideFiltersPane" }),
    saveFilters: intl.formatMessage({ id: "actions.saveFilters" }),
    restoreDefaults: intl.formatMessage({ id: "actions.restoreDefaults" }),
  };
}

function FilterPaneHeader(props) {
  const {
    onClose,
    autoFocus = false,
    "aria-controls": ariaControls,
    className,
    ...other
  } = props;

  const classes = useStyles();
  const messages = useMessages();
  const buttonRef = useRef();
  const [showDialog, setShowDialog] = useState(false);
  const presetApi = PresetAPI.use();
  const currentFilters = useSelector(selectFileFilters);
  const dispatch = useDispatch();
  const dirty = !lodash.isEqual(currentFilters, PresetAPI.DefaultFilters);

  const handleCreate = useCallback(
    (preset) => presetApi.addPreset(preset),
    [presetApi]
  );

  const handleCloseDialog = useCallback(() => setShowDialog(false));

  const handleShowDialog = useCallback(() => setShowDialog(true));

  const handleRestoreDefaults = useCallback(() => {
    dispatch(updateFilters(filesInitialState.filters));
  }, []);

  useEffect(() => {
    if (autoFocus) {
      buttonRef.current?.focus();
    }
  }, [autoFocus, buttonRef]);

  return (
    <div className={clsx(classes.header, className)} {...other}>
      <SquaredIconButton
        onClick={onClose}
        variant="outlined"
        color="secondary"
        className={classes.toggleButton}
        ref={buttonRef}
        aria-label={messages.hideLabel}
        aria-controls={ariaControls}
      >
        <TuneIcon />
      </SquaredIconButton>

      <div className={classes.title}>{messages.title}</div>
      <Tooltip title={messages.saveFilters}>
        <div>
          <IconButton
            onClick={handleShowDialog}
            size="small"
            aria-label={messages.saveFilters}
            disabled={!dirty}
          >
            <SaveOutlinedIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Tooltip title={messages.restoreDefaults}>
        <div>
          <IconButton
            onClick={handleRestoreDefaults}
            size="small"
            aria-label={messages.restoreDefaults}
            disabled={!dirty}
          >
            <SettingsBackupRestoreIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Tooltip title={messages.hideLabel}>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label={messages.hideLabel}
          aria-controls={ariaControls}
        >
          <CloseOutlinedIcon />
        </IconButton>
      </Tooltip>
      <AddPresetDialog
        open={showDialog}
        onClose={handleCloseDialog}
        onCreate={handleCreate}
      />
    </div>
  );
}

FilterPaneHeader.propTypes = {
  /**
   * Autofocus header when shown
   */
  autoFocus: PropTypes.bool,
  /**
   * Handle close button.
   */
  onClose: PropTypes.func,
  /**
   * Handle save preset button.
   */
  className: PropTypes.string,
  "aria-controls": PropTypes.string,
};

export default FilterPaneHeader;