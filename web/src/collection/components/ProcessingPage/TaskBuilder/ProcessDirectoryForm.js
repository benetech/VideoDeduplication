import React, { useCallback, useEffect } from "react";
import clsx from "clsx";
import lodash from "lodash";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import InputContainer from "./InputContainer";
import { Chip, TextField } from "@material-ui/core";
import { useIntl } from "react-intl";
import BoolInput from "../../../../common/components/BoolInput";
import TaskRequestType from "../../../prop-types/TaskRequestType";
import TaskRequest from "../../../state/tasks/TaskRequest";
import Section from "./Section";
import { Autocomplete } from "@material-ui/lab";
import Grid from "@material-ui/core/Grid";
import Description from "./Description";

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
 * Update numeric field
 */
function useNumber(request, onChange, field) {
  return useHandler(request, onChange, field, Number);
}

/**
 * Update field by event.
 */
function useHandler(request, onChange, field, convert = (value) => value) {
  return useCallback(
    (event, newValue) => {
      onChange(
        updateAttr(request, field, convert(newValue || event.target.value))
      );
    },
    [request, onChange]
  );
}

/**
 * Update field by value.
 */
function useUpdate(request, onChange, field) {
  return useCallback(
    (value) => {
      onChange(updateAttr(request, field, value));
    },
    [request, onChange]
  );
}

/**
 * Update bool.
 */
function updateAttr(object, field, value) {
  if (value === "" || (Array.isArray(value) && value.length === 0)) {
    value = undefined;
  }
  return lodash.omitBy({ ...object, [field]: value }, lodash.isNil);
}

/**
 * Check if optional value is positive.
 */
function positive(value) {
  return value == null || value > 0;
}

/**
 * Check if optional value is positive.
 */
function nonNegative(value) {
  return value == null || value >= 0;
}

/**
 * Validate request.
 */
function validate(request) {
  return (
    !!request.directory &&
    positive(request.frameSampling) &&
    nonNegative(request.darkThreshold) &&
    nonNegative(request.matchDist) &&
    nonNegative(request.minDuration)
  );
}

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    dir: intl.formatMessage({ id: "task.attr.directory" }),
    dirHelp: intl.formatMessage({ id: "task.attr.directory.help" }),
    sampling: intl.formatMessage({ id: "task.attr.frameSampling" }),
    samplingHelp: intl.formatMessage({ id: "task.attr.frameSampling.help" }),
    matchDist: intl.formatMessage({ id: "task.attr.matchDistance" }),
    matchDistHelp: intl.formatMessage({ id: "task.attr.matchDistance.help" }),
    filterDark: intl.formatMessage({ id: "task.attr.filterDark" }),
    filterDarkHelp: intl.formatMessage({ id: "task.attr.filterDark.help" }),
    darkThreshold: intl.formatMessage({ id: "task.attr.darkThreshold" }),
    darkThresholdHelp: intl.formatMessage({
      id: "task.attr.darkThreshold.help",
    }),
    minDuration: intl.formatMessage({ id: "task.attr.minDurationSeconds" }),
    minDurationHelp: intl.formatMessage({
      id: "task.attr.minDurationSeconds.help",
    }),
    extensions: intl.formatMessage({ id: "task.attr.extensions" }),
    extensionsHelp: intl.formatMessage({ id: "task.attr.extensions.help" }),
    extShort: intl.formatMessage({ id: "task.attr.extensions.short" }),
    description: intl.formatMessage({ id: "task.type.directory.description" }),
  };
}

// Well-known extensions...
const predefinedExtensions = ["mp4", "ogv", "webm", "avi", "mkv"];

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
  const handleSamplingChange = useNumber(request, onChange, "frameSampling");
  const handleMatchDistChange = useNumber(request, onChange, "matchDistance");
  const handleFilterDarkChange = useUpdate(request, onChange, "filterDark");
  const handleDarkThrChange = useNumber(request, onChange, "darkThreshold");
  const handleMinDurationChange = useNumber(request, onChange, "minDuration");
  const handleExtChange = useHandler(request, onChange, "extensions");

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
      <Section title="Configuration" collapse>
        <InputContainer
          title={messages.extensions}
          tooltip={messages.extensionsHelp}
        >
          <Autocomplete
            multiple
            options={predefinedExtensions}
            defaultValue={["mp4"]}
            value={request.extensions || []}
            onChange={handleExtChange}
            freeSolo
            color="secondary"
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                color="secondary"
                label={messages.extensions}
              />
            )}
          />
        </InputContainer>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <InputContainer
              title={messages.sampling}
              tooltip={messages.samplingHelp}
            >
              <TextField
                label={messages.sampling}
                type="number"
                variant="filled"
                color="secondary"
                placeholder="1"
                value={request.frameSampling || ""}
                onChange={handleSamplingChange}
                error={!positive(request.frameSampling)}
                className={classes.input}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </InputContainer>
          </Grid>
          <Grid item xs={6}>
            <InputContainer
              title={messages.matchDist}
              tooltip={messages.matchDistHelp}
            >
              <TextField
                label={messages.matchDist}
                type="number"
                variant="filled"
                color="secondary"
                placeholder="0.75"
                value={request.matchDistance || ""}
                onChange={handleMatchDistChange}
                error={!nonNegative(request.matchDistance)}
                className={classes.input}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </InputContainer>
          </Grid>
          <Grid item xs={6}>
            <InputContainer
              title={messages.darkThreshold}
              tooltip={messages.darkThresholdHelp}
            >
              <TextField
                label={messages.darkThreshold}
                type="number"
                variant="filled"
                color="secondary"
                placeholder="2"
                value={request.darkThreshold || ""}
                onChange={handleDarkThrChange}
                error={!nonNegative(request.darkThreshold)}
                className={classes.input}
                disabled={request.filterDark === false}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </InputContainer>
          </Grid>
          <Grid item xs={6}>
            <InputContainer
              title={messages.minDuration}
              tooltip={messages.minDurationHelp}
            >
              <TextField
                label={messages.minDuration}
                type="number"
                variant="filled"
                color="secondary"
                placeholder="3"
                value={request.minDuration || ""}
                onChange={handleMinDurationChange}
                error={!nonNegative(request.minDuration)}
                className={classes.input}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </InputContainer>
          </Grid>
          <Grid item xs={6}>
            <InputContainer
              title={messages.filterDark}
              tooltip={messages.filterDarkHelp}
            >
              <BoolInput
                value={request.filterDark}
                onChange={handleFilterDarkChange}
              />
            </InputContainer>
          </Grid>
        </Grid>
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
