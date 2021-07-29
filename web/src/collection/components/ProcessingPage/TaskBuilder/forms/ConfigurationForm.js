import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { Autocomplete } from "@material-ui/lab";
import { Chip, TextField } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { useIntl } from "react-intl";
import TaskConfigType from "../../../../../prop-types/TaskConfigType";
import InputContainer from "../InputContainer";
import BoolInput from "../../../../../common/components/BoolInput";
import { useHandler, useNumber, useUpdate } from "./hooks";
import { nonNegative, positive } from "./validation";

const useStyles = makeStyles({
  input: {
    width: "100%",
  },
});

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
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
const defaultKnownExtensions = ["mp4", "ogv", "webm", "avi", "mkv"];

function ConfigurationForm(props) {
  const {
    config,
    onChange,
    knownExtensions = defaultKnownExtensions,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages();

  // Define attribute handlers
  const handleSamplingChange = useNumber(config, onChange, "frameSampling");
  const handleMatchDistChange = useNumber(config, onChange, "matchDistance");
  const handleFilterDarkChange = useUpdate(config, onChange, "filterDark");
  const handleDarkThrChange = useNumber(config, onChange, "darkThreshold");
  const handleMinDurationChange = useNumber(config, onChange, "minDuration");
  const handleExtChange = useHandler(config, onChange, "extensions");

  return (
    <div className={clsx(className)} {...other}>
      <InputContainer
        title={messages.extensions}
        tooltip={messages.extensionsHelp}
      >
        <Autocomplete
          multiple
          options={knownExtensions}
          defaultValue={["mp4"]}
          value={config.extensions || []}
          onChange={handleExtChange}
          freeSolo
          color="secondary"
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option}
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
              value={config.frameSampling || ""}
              onChange={handleSamplingChange}
              error={!positive(config.frameSampling)}
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
              value={config.matchDistance || ""}
              onChange={handleMatchDistChange}
              error={!nonNegative(config.matchDistance)}
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
              value={config.darkThreshold || ""}
              onChange={handleDarkThrChange}
              error={!nonNegative(config.darkThreshold)}
              className={classes.input}
              disabled={config.filterDark === false}
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
              value={config.minDuration || ""}
              onChange={handleMinDurationChange}
              error={!nonNegative(config.minDuration)}
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
              value={config.filterDark}
              onChange={handleFilterDarkChange}
            />
          </InputContainer>
        </Grid>
      </Grid>
    </div>
  );
}

ConfigurationForm.propTypes = {
  /**
   * Task common configuration.
   */
  config: TaskConfigType.isRequired,
  /**
   * Handle task config change.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Predefined extensions for auto-completion.
   */
  knownExtensions: PropTypes.arrayOf(PropTypes.string.isRequired),
  className: PropTypes.string,
};

export default ConfigurationForm;
