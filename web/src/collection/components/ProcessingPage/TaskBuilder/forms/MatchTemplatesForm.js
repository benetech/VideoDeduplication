import React, { useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskRequestType from "../../../../prop-types/TaskRequestType";
import { useIntl } from "react-intl";
import Description from "./../Description";
import TaskRequest from "../../../../../application/state/tasks/TaskRequest";

const useStyles = makeStyles((theme) => ({
  description: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    description: intl.formatMessage({ id: "task.type.templates.description" }),
  };
}

function MatchTemplatesForm(props) {
  const { onChange, onValidated, className, ...other } = props;
  const messages = useMessages();
  const classes = useStyles();

  // Initialize state
  useEffect(() => onChange({ type: TaskRequest.MATCH_TEMPLATES }), []);
  useEffect(() => onValidated(true), []);

  return (
    <div className={clsx(className)} {...other}>
      <Description
        className={classes.description}
        text={messages.description}
      />
    </div>
  );
}

MatchTemplatesForm.propTypes = {
  /**
   * Task request.
   */
  request: TaskRequestType.isRequired,
  /**
   * Handle task request attributes change.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Request validation results.
   */
  valid: PropTypes.bool,
  /**
   * Handle request validation update.
   */
  onValidated: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default MatchTemplatesForm;
