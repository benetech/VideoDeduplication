import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import LinearProgress from "@material-ui/core/LinearProgress";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.spacing(1),
  },
  title: {
    ...theme.mixins.text,
  },
  valueContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  indicator: {
    flexGrow: 1,
    margin: theme.spacing(1),
  },
}));

const DistanceIndicator = withStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: theme.spacing(1),
  },
  colorPrimary: {
    backgroundColor: "#EEEEEE",
  },
  bar: {
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
}))(LinearProgress);

/**
 * Get i18n text
 */
function useMessages(distance) {
  const intl = useIntl();
  return {
    score: intl.formatMessage(
      { id: "distance.score" },
      { value: (1 - distance).toFixed(1) }
    ),
  };
}

/**
 * Distance score in percents
 */
function score(value) {
  return 100 * (1 - value);
}

function Distance(props) {
  const { value, className } = props;
  const classes = useStyles();
  const messages = useMessages(value);
  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.title}>{messages.score}</div>
      <div className={classes.valueContainer}>
        <div>1.0</div>
        <DistanceIndicator
          className={classes.indicator}
          value={score(value)}
          variant="determinate"
        />
        <div>0.0</div>
      </div>
    </div>
  );
}

Distance.propTypes = {
  /**
   * Distance value
   */
  value: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default Distance;
