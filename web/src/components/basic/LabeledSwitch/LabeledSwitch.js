import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme) => ({
  switch: {},
  label: {
    flexShrink: 1,
    minWidth: 0,
    ...theme.mixins.text,
    ...theme.mixins.textEllipsis,
    color: theme.palette.action.textInactive,
  },
}));

function LabeledSwitch(props) {
  const { value, onChange, label, tooltip, className } = props;
  const classes = useStyles();

  const handleChange = useCallback(() => onChange(!value), [value]);

  return (
    <Tooltip title={tooltip} enterDelay={500}>
      <FormControlLabel
        className={clsx(classes.switch, className)}
        control={
          <Switch
            checked={value}
            onChange={handleChange}
            color="default"
            size="small"
            inputProps={{ "aria-label": tooltip }}
          />
        }
        labelPlacement="start"
        label={<div className={classes.label}>{label}</div>}
      />
    </Tooltip>
  );
}

LabeledSwitch.propTypes = {
  /**
   * Fires when switch state changes.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Switch state
   */
  value: PropTypes.bool,
  /**
   * Switch label.
   */
  label: PropTypes.string.isRequired,
  /**
   * Switch tooltip text.
   */
  tooltip: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default LabeledSwitch;
