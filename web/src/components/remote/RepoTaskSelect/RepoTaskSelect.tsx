import React, { useCallback } from "react";
import { InputLabel, MenuItem, Select } from "@material-ui/core";
import { TaskRequestType } from "../../../model/Task";
import FormControl from "@material-ui/core/FormControl";
import { RepoTaskRequest } from "../RepoTaskForm";
import { useIntl } from "react-intl";
import { Repository } from "../../../model/VideoFile";
import useUniqueId from "../../../lib/hooks/useUniqueId";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    task: intl.formatMessage({ id: "tasks.one" }),
    pull(repository: Repository): string {
      return intl.formatMessage(
        { id: "task.type.pullFingerprints.long" },
        { name: repository.name }
      );
    },
    push(repository: Repository): string {
      return intl.formatMessage(
        { id: "task.type.pushFingerprints.long" },
        { name: repository.name }
      );
    },
    match(repository: Repository): string {
      return intl.formatMessage(
        { id: "task.type.matchRemote.repo" },
        { name: repository.name }
      );
    },
  };
}

type RepoTaskSelectProps = {
  repository: Repository;
  type: RepoTaskRequest["type"];
  onChange: (type: RepoTaskRequest["type"]) => void;
  className?: string;
};

export default function RepoTaskSelect(
  props: RepoTaskSelectProps
): JSX.Element {
  const { type, onChange, repository, className } = props;
  const messages = useMessages();
  const labelId = useUniqueId("task-select-label-");
  const handleSelect = useCallback((event) => onChange(event.target.value), []);

  return (
    <FormControl
      variant="outlined"
      fullWidth
      size="small"
      className={className}
    >
      <InputLabel id={labelId}>{messages.task}</InputLabel>
      <Select
        labelId={labelId}
        value={type}
        onChange={handleSelect}
        label={messages.task}
      >
        <MenuItem value={TaskRequestType.PULL_FINGERPRINTS}>
          {messages.pull(repository)}
        </MenuItem>
        <MenuItem value={TaskRequestType.PUSH_FINGERPRINTS}>
          {messages.push(repository)}
        </MenuItem>
        <MenuItem value={TaskRequestType.MATCH_REMOTE_FINGERPRINTS}>
          {messages.match(repository)}
        </MenuItem>
      </Select>
    </FormControl>
  );
}
