import React, { useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import InputContainer from "../InputContainer";
import { TextField } from "@material-ui/core";
import { useIntl } from "react-intl";
import TaskRequestType from "../../../../../prop-types/TaskRequestType";
import TaskRequest from "../../../../../application/state/tasks/TaskRequest";
import Section from "../Section";
import Description from "../Description";
import { validateTaskConfig } from "./validation";
import ConfigurationForm from "./ConfigurationForm";
import { useHandler } from "./hooks";

const useStyles = makeStyles((theme) => ({
  input: {
    width: "100%",
  },
  description: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
}));

/**
 * Validate request.
 */
function validate(request) {
  return !!request.directory && validateTaskConfig(request);
}

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    dir: intl.formatMessage({ id: "task.attr.directory" }),
    dirHelp: intl.formatMessage({ id: "task.attr.directory.help" }),
    description: intl.formatMessage({ id: "task.type.directory.description" }),
    config: intl.formatMessage({ id: "config" }),
  };
}

function ProcessDirectoryForm(props) {
  const { request, onChange, onValidated, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  // Initialize request
  useEffect(
    () => onChange({ type: TaskRequest.DIRECTORY, directory: "." }),
    []
  );

  // Validate request on each change
  useEffect(() => onValidated(validate(request)), [request, onValidated]);

  // Handle attribute change
  const handleDirChange = useHandler(request, onChange, "directory");

  return (
    <div className={clsx(className)} {...other}>
      <Description
        className={classes.description}
        text={messages.description}
      />
      <InputContainer title={messages.dir} tooltip={messages.dirHelp}>
        <TextField
          id="filled-basic"
          label={messages.dir}
          variant="outlined"
          color="secondary"
          value={request.directory || ""}
          required
          error={!request.directory}
          onChange={handleDirChange}
          className={classes.input}
        />
      </InputContainer>
      <Section title={messages.config} collapse>
        <ConfigurationForm config={request} onChange={onChange} />
      </Section>
    </div>
  );
}

ProcessDirectoryForm.propTypes = {
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

export default ProcessDirectoryForm;
