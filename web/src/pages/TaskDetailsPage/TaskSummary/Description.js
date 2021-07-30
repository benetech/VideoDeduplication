import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../prop-types/TaskType";
import { useIntl } from "react-intl";
import getTaskTextDescription from "./helpers/getTaskTextDescription";
import { format } from "date-fns";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 2,
    flexShrink: 1,
  },
  description: {
    fontFamily: "Roboto",
    fontSize: 26,
    letterSpacing: 0,
    lineHeight: "30px",
    fontWeight: 500,
  },
  created: {
    ...theme.mixins.valueHighlighted,
    fontWeight: "normal",
    color: theme.palette.action.textInactive,
  },
  date: {},
}));

/**
 * Get translated text.
 */
function useMessages(task) {
  const intl = useIntl();
  return {
    description: getTaskTextDescription(task.request, intl),
    created: intl.formatMessage({ id: "task.created" }),
  };
}

function Description(props) {
  const { task, className, ...other } = props;
  const messages = useMessages(task);
  const classes = useStyles();

  return (
    <div className={clsx(classes.container, className)} {...other}>
      <div className={classes.description}>{messages.description}</div>
      <div>
        <div className={classes.created}>{messages.created}:</div>
        <div className={classes.date}>
          {format(task.submissionTime, "d LLL yyyy")}
        </div>
      </div>
    </div>
  );
}

Description.propTypes = {
  /**
   * Background task which will be summarized.
   */
  task: TaskType,
  className: PropTypes.string,
};

export default Description;
