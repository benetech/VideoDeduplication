import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Tooltip from "@material-ui/core/Tooltip";
import { useIntl } from "react-intl";

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

function useMessages() {
  const intl = useIntl();
  return {
    blurDescription: intl.formatMessage({ id: "aria.label.blurAllScenes" }),
    blurAction: intl.formatMessage({ id: "actions.blurScenes" }),
  };
}

function BlurSwitch(props) {
  const { blur, onBlurChange, className } = props;
  const messages = useMessages();
  const classes = useStyles();

  const handleChange = useCallback(() => onBlurChange(!blur), [blur]);

  return (
    <Tooltip title={messages.blurDescription} enterDelay={500}>
      <FormControlLabel
        className={clsx(classes.switch, className)}
        control={
          <Switch
            checked={blur}
            onChange={handleChange}
            color="default"
            size="small"
            inputProps={{ "aria-label": messages.blurDescription }}
          />
        }
        labelPlacement="start"
        label={<div className={classes.label}>{messages.blurAction}</div>}
      />
    </Tooltip>
  );
}

BlurSwitch.propTypes = {
  /**
   * Fires when blur changes.
   */
  onBlurChange: PropTypes.func,
  /**
   * Blur state
   */
  blur: PropTypes.bool,
  className: PropTypes.string,
};

export default BlurSwitch;
