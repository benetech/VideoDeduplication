import React, { useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
import { TaskBuilderProps } from "../model";
import { PushFingerprintsRequest } from "../../../../model/Task";
import useRepositoriesAll from "../../../../application/api/repositories/useRepositoriesAll";
import InputContainer from "../../../forms/InputContainer";
import Description from "../../../forms/Description";
import { useIntl } from "react-intl";
import FormControl from "@material-ui/core/FormControl";
import useUniqueId from "../../../../lib/hooks/useUniqueId";

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
      id: "task.type.pushFingerprints.description",
    }),
    repo: intl.formatMessage({ id: "task.attr.pushRepository" }),
    repoHelp: intl.formatMessage({ id: "task.attr.pushRepository.help" }),
  };
}

export default function PushFingerprints(
  props: TaskBuilderProps<PushFingerprintsRequest>
): JSX.Element {
  const { request, onChange, onValidated, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const labelId = useUniqueId("label-");
  const { repositories } = useRepositoriesAll();

  const renderValue = useCallback(
    (selectedId) =>
      repositories.find((repo) => repo.id === selectedId)?.name || "",
    [repositories]
  );

  useEffect(
    () => onValidated(request.repositoryId > 0),
    [request.repositoryId]
  );

  const handleChange = useCallback(
    (event) => {
      onChange({ ...request, repositoryId: event.target.value });
    },
    [onChange]
  );

  return (
    <div className={className}>
      <Description
        className={classes.description}
        text={messages.description}
      />
      <InputContainer title={messages.repo} tooltip={messages.repoHelp}>
        <FormControl fullWidth variant="outlined">
          <InputLabel id={labelId}>{messages.repo}</InputLabel>
          <Select
            labelId={labelId}
            value={request.repositoryId}
            onChange={handleChange}
            renderValue={renderValue}
            disabled={repositories.length === 0}
            labelWidth={80}
          >
            {repositories.map((repository) => (
              <MenuItem key={repository.id} value={repository.id}>
                <ListItemText primary={repository.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </InputContainer>
    </div>
  );
}
