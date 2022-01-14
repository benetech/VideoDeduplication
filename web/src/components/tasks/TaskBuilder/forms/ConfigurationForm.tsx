import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Chip, TextField, Theme } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import Grid from "@material-ui/core/Grid";
import { useIntl } from "react-intl";
import { TaskConfig } from "../../../../model/Task";
import InputContainer from "../../../forms/InputContainer";
import BoolInput from "../../../basic/BoolInput";
import { nonNegative, positive } from "./validation";
import { useUpdates } from "./useUpdates";

const useStyles = makeStyles<Theme>({
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
    sampling: intl.formatMessage({
      id: "task.attr.frameSampling",
    }),
    samplingHelp: intl.formatMessage({
      id: "task.attr.frameSampling.help",
    }),
    matchDist: intl.formatMessage({
      id: "task.attr.matchDistance",
    }),
    matchDistHelp: intl.formatMessage({
      id: "task.attr.matchDistance.help",
    }),
    filterDark: intl.formatMessage({
      id: "task.attr.filterDark",
    }),
    filterDarkHelp: intl.formatMessage({
      id: "task.attr.filterDark.help",
    }),
    darkThreshold: intl.formatMessage({
      id: "task.attr.darkThreshold",
    }),
    darkThresholdHelp: intl.formatMessage({
      id: "task.attr.darkThreshold.help",
    }),
    minDuration: intl.formatMessage({
      id: "task.attr.minDurationSeconds",
    }),
    minDurationHelp: intl.formatMessage({
      id: "task.attr.minDurationSeconds.help",
    }),
    extensions: intl.formatMessage({
      id: "task.attr.extensions",
    }),
    extensionsHelp: intl.formatMessage({
      id: "task.attr.extensions.help",
    }),
    extShort: intl.formatMessage({
      id: "task.attr.extensions.short",
    }),
    description: intl.formatMessage({
      id: "task.type.directory.description",
    }),
  };
} // Well-known extensions...

const defaultKnownExtensions = ["mp4", "ogv", "webm", "avi", "mkv"];

function ConfigurationForm(props: ConfigurationFormProps): JSX.Element {
  const {
    config,
    onChange,
    knownExtensions = defaultKnownExtensions,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages(); // Define attribute handlers

  const { useTextField, useFieldInput, useAutocompleteField } =
    useUpdates<TaskConfig>(config, onChange);
  const updateSampling = useTextField("frameSampling", Number);
  const updateMatchDist = useTextField("matchDistance", Number);
  const updateFilterDark = useFieldInput<boolean | null>("filterDark", Boolean);
  const updateDarkThr = useTextField("darkThreshold", Number);
  const updateMinDuration = useTextField("minDuration", Number);
  const updateExtensions = useAutocompleteField(
    "extensions",
    (value: string[]) => value || knownExtensions
  );

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
          onChange={updateExtensions}
          freeSolo
          color="secondary"
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option}
                variant="outlined"
                label={option}
                {...getTagProps({
                  index,
                })}
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
              onChange={updateSampling}
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
              onChange={updateMatchDist}
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
              onChange={updateDarkThr}
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
              onChange={updateMinDuration}
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
              value={config.filterDark || null}
              onChange={updateFilterDark}
            />
          </InputContainer>
        </Grid>
      </Grid>
    </div>
  );
}

type ConfigurationFormProps = {
  /**
   * Task common configuration.
   */
  config: TaskConfig;

  /**
   * Handle task config change.
   */
  onChange: (config: TaskConfig) => void;

  /**
   * Predefined extensions for auto-completion.
   */
  knownExtensions?: string[];
  className?: string;
};
export default ConfigurationForm;
