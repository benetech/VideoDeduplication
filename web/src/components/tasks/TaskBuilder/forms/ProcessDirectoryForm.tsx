import React, { useCallback, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { TextField, Theme } from "@material-ui/core";
import InputContainer from "../../../forms/InputContainer/InputContainer";
import { useIntl } from "react-intl";
import {
  ProcessDirectoryRequest,
  TaskConfig,
  TaskRequest,
  TaskRequestType,
} from "../../../../model/Task";
import Section from "../Section";
import Description from "../../../forms/Description";
import { validateTaskConfig } from "./validation";
import ConfigurationForm from "./ConfigurationForm";
import { TaskBuilderProps } from "../model";
import { useUpdates } from "./useUpdates";

const useStyles = makeStyles<Theme>((theme) => ({
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
function validate(request: TaskRequest): boolean {
  return (
    request.type === TaskRequestType.DIRECTORY &&
    !!request.directory &&
    validateTaskConfig(request)
  );
}

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    dir: intl.formatMessage({
      id: "task.attr.directory",
    }),
    dirHelp: intl.formatMessage({
      id: "task.attr.directory.help",
    }),
    description: intl.formatMessage({
      id: "task.type.directory.description",
    }),
    config: intl.formatMessage({
      id: "config",
    }),
  };
}

export default function ProcessDirectoryForm(
  props: TaskBuilderProps<ProcessDirectoryRequest>
): JSX.Element | null {
  const { request, onChange, onValidated, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages(); // Initialize request

  const updateConfig = useCallback(
    (config: TaskConfig) => onChange({ ...request, ...config }),
    [request]
  );

  useEffect(() => onValidated(validate(request)), [request, onValidated]); // Handle attribute change

  const { useTextField } = useUpdates(request, onChange);
  const updateDir = useTextField("directory", (dir) => dir);

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
          onChange={updateDir}
          className={classes.input}
        />
      </InputContainer>
      <Section title={messages.config} collapse>
        <ConfigurationForm config={request} onChange={updateConfig} />
      </Section>
    </div>
  );
}
