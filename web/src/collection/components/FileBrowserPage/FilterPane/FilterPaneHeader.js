import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TuneIcon from "@material-ui/icons/Tune";
import IconButton from "@material-ui/core/IconButton";
import SaveOutlinedIcon from "@material-ui/icons/SaveOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import SquaredIconButton from "../../../../common/components/SquaredIconButton";
import { useIntl } from "react-intl";

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

function FilterPaneHeader(props, ref) {
  const {
    onClose,
    onSave,
    autoFocus = false,
    "aria-controls": ariaControls,
    className,
    ...other
  } = props;

  const classes = useStyles();
  const intl = useIntl();
  const buttonRef = useRef();

  useEffect(() => {
    if (autoFocus) {
      console.log("Focusing", buttonRef.current);
      buttonRef.current.focus();
      // setTimeout(() => );
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
        aria-label={intl.formatMessage({ id: "actions.hideFiltersPane" })}
        aria-controls={ariaControls}
      >
        <TuneIcon />
      </SquaredIconButton>

      <div className={classes.title}>
        {intl.formatMessage({ id: "filter.title" })}
      </div>
      <IconButton
        onClick={onSave}
        size="small"
        aria-label={intl.formatMessage({ id: "actions.saveFilters" })}
      >
        <SaveOutlinedIcon />
      </IconButton>
      <IconButton
        onClick={onClose}
        size="small"
        aria-label={intl.formatMessage({ id: "actions.hideFiltersPane" })}
        aria-controls={ariaControls}
      >
        <CloseOutlinedIcon />
      </IconButton>
    </div>
  );
}

FilterPaneHeader.propTypes = {
  /**
   * Autofocus header when shown
   */
  autoFocus: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  className: PropTypes.string,
};

export default FilterPaneHeader;
