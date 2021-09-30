import React, { useCallback, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { TextField, Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import Description from "../Description";
import ConfigurationForm from "./ConfigurationForm";
import Section from "../Section";
import { validateTaskConfig } from "./validation";
import InputContainer from "../InputContainer";
import { TaskBuilderProps } from "../model";
import {
  makeProcessOnlineVideoRequest,
  ProcessOnlineVideoRequest,
  TaskConfig,
} from "../../../../model/Task";
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
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    description: intl.formatMessage({
      id: "task.type.processOnline.description",
    }),
    config: intl.formatMessage({
      id: "config",
    }),
    urls: intl.formatMessage({
      id: "task.attr.onlineVideoURLs",
    }),
    urlsShort: intl.formatMessage({
      id: "task.attr.onlineVideoURLs.short",
    }),
    urlsHelp: intl.formatMessage({
      id: "task.attr.onlineVideoURLs.help",
    }),
    destination: intl.formatMessage({
      id: "task.attr.onlineDestination",
    }),
    destinationShort: intl.formatMessage({
      id: "task.attr.onlineDestination.short",
    }),
    destinationHelp: intl.formatMessage({
      id: "task.attr.onlineDestination.help",
    }),
  };
}

/**
 * Validate request.
 */
function validate(request: ProcessOnlineVideoRequest): boolean {
  return (
    request.urls?.length > 0 &&
    !!request.destinationTemplate &&
    validateTaskConfig(request)
  );
}

/**
 * Split urls.
 */
function split(urls: string): string[] {
  return urls.split("\n");
}

export default function ProcessOnlineVideoForm(
  props: TaskBuilderProps<ProcessOnlineVideoRequest>
): JSX.Element | null {
  const { request, onChange, onValidated, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages(); // Initialize request

  useEffect(() => onChange(makeProcessOnlineVideoRequest()), []);
  useEffect(() => onValidated(validate(request)), [request, onValidated]); // Attribute handlers

  const updateConfig = useCallback(
    (config: TaskConfig) => onChange({ ...request, ...config }),
    [request]
  );

  const { useTextField } = useUpdates(request, onChange);
  const updateURLs = useTextField("urls", split);
  const updateDest = useTextField("destinationTemplate", (value) => value);

  return (
    <div className={clsx(className)} {...other}>
      <Description
        className={classes.description}
        text={messages.description}
      />
      <InputContainer title={messages.urls} tooltip={messages.urlsHelp}>
        <TextField
          label={messages.urlsShort}
          variant="outlined"
          color="secondary"
          value={request.urls?.join("\n") || ""}
          required
          error={!(request.urls?.length > 0)}
          onChange={updateURLs}
          multiline
          className={classes.input}
        />
      </InputContainer>
      <InputContainer
        title={messages.destination}
        tooltip={messages.destinationHelp}
      >
        <TextField
          label={messages.destinationShort}
          variant="outlined"
          color="secondary"
          value={request.destinationTemplate || ""}
          required
          error={!request.destinationTemplate}
          onChange={updateDest}
          className={classes.input}
        />
      </InputContainer>
      <Section title={messages.config} collapse>
        <ConfigurationForm config={request} onChange={updateConfig} />
      </Section>
    </div>
  );
}
