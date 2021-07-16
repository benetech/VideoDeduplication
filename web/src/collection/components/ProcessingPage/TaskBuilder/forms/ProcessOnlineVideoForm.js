import React, { useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import Description from "../Description";
import ConfigurationForm from "./ConfigurationForm";
import Section from "../Section";
import TaskRequestType from "../../../../prop-types/TaskRequestType";
import TaskRequest from "../../../../state/tasks/TaskRequest";
import { validateTaskConfig } from "./validation";
import { TextField } from "@material-ui/core";
import InputContainer from "../InputContainer";
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
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    description: intl.formatMessage({
      id: "task.type.processOnline.description",
    }),
    config: intl.formatMessage({ id: "config" }),
    urls: intl.formatMessage({ id: "task.attr.onlineVideoURLs" }),
    urlsShort: intl.formatMessage({ id: "task.attr.onlineVideoURLs.short" }),
    urlsHelp: intl.formatMessage({ id: "task.attr.onlineVideoURLs.help" }),
    destination: intl.formatMessage({ id: "task.attr.onlineDestination" }),
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
function validate(request) {
  return (
    request.urls?.length > 0 &&
    !!request.destinationTemplate &&
    validateTaskConfig(request)
  );
}

/**
 * Split urls.
 * @param urls
 */
function split(urls) {
  return urls.split("\n");
}

function ProcessOnlineVideoForm(props) {
  const { request, onChange, onValidated, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  // Initialize request
  useEffect(
    () =>
      onChange({
        type: TaskRequest.PROCESS_ONLINE_VIDEO,
        urls: [],
        destinationTemplate: "%(title)s.%(ext)s",
      }),
    []
  );

  // Validate request on each change
  useEffect(() => onValidated(validate(request)), [request, onValidated]);

  // Attribute handlers
  const handleUrls = useHandler(request, onChange, "urls", split);
  const handleDest = useHandler(request, onChange, "destinationTemplate");

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
          onChange={handleUrls}
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
          onChange={handleDest}
          className={classes.input}
        />
      </InputContainer>
      <Section title={messages.config} collapse>
        <ConfigurationForm config={request} onChange={onChange} />
      </Section>
    </div>
  );
}

ProcessOnlineVideoForm.propTypes = {
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

export default ProcessOnlineVideoForm;
