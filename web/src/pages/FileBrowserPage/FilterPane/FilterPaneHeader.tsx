import React, { useCallback, useEffect, useRef, useState } from "react";
import lodash from "lodash";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import TuneIcon from "@material-ui/icons/Tune";
import IconButton from "@material-ui/core/IconButton";
import SaveOutlinedIcon from "@material-ui/icons/SaveOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import SquaredIconButton from "../../../components/basic/SquaredIconButton";
import { useIntl } from "react-intl";
import { Theme, Tooltip } from "@material-ui/core";
import AddPresetDialog from "./AddPresetDialog";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
import useFilesColl from "../../../application/api/files/useFilesColl";
import { useCreatePreset } from "../../../application/api/presets/usePresetsAPI";
import { DefaultFilters } from "../../../model/VideoFile";

const useStyles = makeStyles<Theme>((theme) => ({
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

function FilterPaneHeader(props: FilterPaneHeaderProps): JSX.Element {
  const {
    onClose,
    autoFocus = false,
    "aria-controls": ariaControls,
    className,
    ...other
  } = props;

  const classes = useStyles();
  const messages = useMessages();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showDialog, setShowDialog] = useState(false);
  const createPreset = useCreatePreset();
  const coll = useFilesColl();
  const currentFilters = coll.params;
  const dirty = !lodash.isEqual(currentFilters, DefaultFilters);

  const handleCloseDialog = useCallback(() => setShowDialog(false), []);
  const handleShowDialog = useCallback(() => setShowDialog(true), []);

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
            onClick={coll.restoreDefaults}
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
        onCreate={createPreset}
      />
    </div>
  );
}

type FilterPaneHeaderProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * Autofocus header when shown
   */
  autoFocus?: boolean;
  /**
   * Handle close button.
   */
  onClose: () => void;
  "aria-controls"?: string;
  className?: string;
};

export default FilterPaneHeader;
