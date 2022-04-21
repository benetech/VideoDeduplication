import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { InputLabel, MenuItem, Select, Theme } from "@material-ui/core";
import embeddingAlgoName from "../../../lib/messages/embeddingAlgoName";
import FormControl from "@material-ui/core/FormControl";
import { useIntl } from "react-intl";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import {
  EmbeddingAlgorithm,
  EmbeddingAlgorithms,
} from "../../../model/embeddings";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles<Theme>({
  embeddingsActions: {
    minWidth: 400,
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  switch: {
    minWidth: 200,
    flexGrow: 0,
    justifyContent: "flex-end",
  },
});

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    algorithm: intl.formatMessage({ id: "task.attr.embeddingAlgorithm.short" }),
    blurDescription: intl.formatMessage({ id: "aria.label.blurAll" }),
    blurAction: intl.formatMessage({ id: "actions.blurVideos" }),
  };
}

type EmbeddingsActionsProps = {
  algorithm: EmbeddingAlgorithm;
  onChange: (algorithm: EmbeddingAlgorithm) => void;
  blur?: boolean;
  onBlurChange: (blur: boolean) => void;
  className?: string;
};

export default function EmbeddingsActions(
  props: EmbeddingsActionsProps
): JSX.Element {
  const { className, algorithm, onChange, blur, onBlurChange } = props;
  const classes = useStyles();
  const messages = useMessages();
  const algoId = useUniqueId("algo-label-");

  const handleAlgo = useCallback(
    (event) => onChange(event.target.value),
    [onChange]
  );

  const updateBlur = useCallback(
    () => onBlurChange(!blur),
    [blur, onBlurChange]
  );

  return (
    <div className={clsx(classes.embeddingsActions, className)}>
      <Tooltip title={messages.blurDescription} enterDelay={500}>
        <FormControlLabel
          className={classes.switch}
          control={
            <Switch
              checked={blur}
              onChange={updateBlur}
              color="primary"
              inputProps={{
                "aria-label": messages.blurDescription,
              }}
            />
          }
          labelPlacement="start"
          label={<div className={classes.label}>{messages.blurAction}</div>}
        />
      </Tooltip>
      <FormControl className={classes.formControl} variant="outlined" fullWidth>
        <InputLabel id={algoId}>{messages.algorithm}</InputLabel>
        <Select
          labelId={algoId}
          value={algorithm}
          onChange={handleAlgo}
          labelWidth={75}
        >
          {EmbeddingAlgorithms.map((algorithm) => (
            <MenuItem value={algorithm} key={algorithm}>
              {embeddingAlgoName(algorithm)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
