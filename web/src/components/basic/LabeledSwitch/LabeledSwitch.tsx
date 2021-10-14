import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles<Theme>((theme) => ({
  switch: {},
  label: {
    flexShrink: 1,
    minWidth: 0,
    ...theme.mixins.text,
    ...theme.mixins.textEllipsis,
    color: theme.palette.action.textInactive,
  },
}));

function LabeledSwitch(props: LabeledSwitchProps): JSX.Element {
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
            inputProps={{
              "aria-label": tooltip,
            }}
          />
        }
        labelPlacement="start"
        label={<div className={classes.label}>{label}</div>}
      />
    </Tooltip>
  );
}

type LabeledSwitchProps = {
  /**
   * Fires when switch state changes.
   */
  onChange: (...args: any[]) => void;

  /**
   * Switch state
   */
  value?: boolean;

  /**
   * Switch label.
   */
  label: string;

  /**
   * Switch tooltip text.
   */
  tooltip: string;
  className?: string;
};
export default LabeledSwitch;
