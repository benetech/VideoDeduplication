import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FormControlLabel, FormGroup, Switch } from "@material-ui/core";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  container: {
    ...theme.mixins.panel,
    padding: theme.spacing(2),
  },
  header: {
    paddingBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  title: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    flexGrow: 1,
  },
}));

const MatchOptionsType = PropTypes.shape({
  showFalsePositive: PropTypes.bool.isRequired,
});

export const DefaultMatchOptions = {
  showFalsePositive: false,
};

/**
 * Get translated text
 */
function useMessages() {
  const intl = useIntl();
  return {
    showFalsePositive: intl.formatMessage({ id: "match.showFalsePositive" }),
    options: intl.formatMessage({ id: "common.options" }),
  };
}

function MatchOptions(props) {
  const { options, onChange, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const handleSwitch = useCallback(
    (event) =>
      onChange({ ...options, [event.target.name]: event.target.checked }),
    [options, onChange]
  );

  return (
    <div className={clsx(classes.container, className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{messages.options}</div>
      </div>
      <FormGroup row>
        <FormControlLabel
          control={
            <Switch
              checked={options.showFalsePositive}
              onChange={handleSwitch}
              name="showFalsePositive"
              color="primary"
            />
          }
          label={messages.showFalsePositive}
        />
      </FormGroup>
    </div>
  );
}

MatchOptions.propTypes = {
  /**
   * Current options.
   */
  options: MatchOptionsType.isRequired,
  /**
   * Handle options change.
   */
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default MatchOptions;
