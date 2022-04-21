import React, { useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Theme,
} from "@material-ui/core";
import { TaskBuilderProps } from "../model";
import { GenerateTilesRequest } from "../../../../model/Task";
import { useIntl } from "react-intl";
import Description from "../../../forms/Description";
import InputContainer from "../../../forms/InputContainer";
import FormControl from "@material-ui/core/FormControl";
import useUniqueId from "../../../../lib/hooks/useUniqueId";
import embeddingAlgoName from "../../../../lib/messages/embeddingAlgoName";
import { EmbeddingAlgorithms } from "../../../../model/embeddings";

const useStyles = makeStyles<Theme>((theme) => ({
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
      id: "task.type.generateTiles.description",
    }),
    force: intl.formatMessage({ id: "task.attr.forceGenerateTiles" }),
    forceHelp: intl.formatMessage({ id: "task.attr.forceGenerateTiles.help" }),
    algorithm: intl.formatMessage({
      id: "task.attr.embeddingAlgorithm",
    }),
    algorithmShort: intl.formatMessage({
      id: "task.attr.embeddingAlgorithm.short",
    }),
    algorithmHelp: intl.formatMessage({
      id: "task.attr.embeddingAlgorithm.help",
    }),
    maxZoom: intl.formatMessage({ id: "task.attr.generateTilesMaxZoom" }),
    maxZoomHelp: intl.formatMessage({ id: "task.attr.generateTilesMaxZoom" }),
  };
}

export default function GenerateTiles(
  props: TaskBuilderProps<GenerateTilesRequest>
): JSX.Element {
  const { request, onChange, onValidated, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const zoomId = useUniqueId("zoom-label-");
  const algoId = useUniqueId("algorithm-label-");

  useEffect(() => onValidated(true), []);

  const handleForceChange = useCallback(
    (event) => {
      onChange({
        ...request,
        force: !!event.target.checked,
      });
    },
    [onChange, request]
  );

  const handleZoom = useCallback(
    (event) =>
      onChange({
        ...request,
        maxZoom: event.target.value,
      }),
    [onChange, request]
  );

  const handleAlgo = useCallback(
    (event) =>
      onChange({
        ...request,
        algorithm: event.target.value,
      }),
    [onChange, request]
  );

  return (
    <div className={className}>
      <Description
        className={classes.description}
        text={messages.description}
      />
      <InputContainer
        title={messages.algorithm}
        tooltip={messages.algorithmHelp}
      >
        <FormControl
          className={classes.formControl}
          variant="outlined"
          fullWidth
        >
          <InputLabel id={algoId}>{messages.algorithmShort}</InputLabel>
          <Select
            labelId={algoId}
            value={request.algorithm}
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
      </InputContainer>
      <InputContainer title={messages.maxZoom} tooltip={messages.maxZoomHelp}>
        <FormControl
          className={classes.formControl}
          variant="outlined"
          fullWidth
        >
          <InputLabel id={zoomId}>{messages.maxZoom}</InputLabel>
          <Select
            labelId={zoomId}
            value={request.maxZoom}
            onChange={handleZoom}
            labelWidth={85}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
              <MenuItem value={level} key={level}>
                {level}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </InputContainer>
      <InputContainer title={messages.force} tooltip={messages.forceHelp}>
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch checked={request.force} onChange={handleForceChange} />
            }
            label={messages.force}
          />
        </FormGroup>
      </InputContainer>
    </div>
  );
}
