import React, { useCallback, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { InputLabel, MenuItem, Select, Theme } from "@material-ui/core";
import { useParams } from "react-router";
import { EntityPageURLParams } from "../../routing/routes";
import useRepository from "../../application/api/repositories/useRepository";
import PaneHeader from "../../components/basic/PaneHeader/PaneHeader";
import Title from "../../components/basic/Title";
import FlatPane from "../../components/basic/FlatPane/FlatPane";
import { useIntl } from "react-intl";
import FormControl from "@material-ui/core/FormControl";
import {
  makePullFingerprintsRequest,
  makePushFingerprintsRequest,
  TaskRequestType,
} from "../../model/Task";
import { Repository } from "../../model/VideoFile";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";
import Button from "../../components/basic/Button";
import useRunTask from "../../application/api/tasks/useRunTask";

const useStyles = makeStyles<Theme>((theme) => ({
  runner: {
    display: "flex",
    alignItems: "center",
  },
  runButton: {
    marginLeft: theme.spacing(1),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "actions.executeTasks" }),
    task: intl.formatMessage({ id: "tasks.one" }),
    runTask: intl.formatMessage({ id: "actions.runTask" }),
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
  };
}

type RepoTasksPaneProps = {
  className?: string;
};

function RepoTasksPane(props: RepoTasksPaneProps): JSX.Element | null {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { id } = useParams<EntityPageURLParams>();
  const { repository } = useRepository(Number(id));
  const runTask = useRunTask();
  const [type, setType] = useState<TaskRequestType>(
    TaskRequestType.PULL_FINGERPRINTS
  );

  const handleSelect = useCallback((event) => setType(event.target.value), []);
  const handleRun = useCallback(async () => {
    if (repository == null) {
      return;
    }
    try {
      switch (type) {
        case TaskRequestType.PUSH_FINGERPRINTS:
          return await runTask(
            makePushFingerprintsRequest({ repositoryId: repository.id })
          );
        case TaskRequestType.PULL_FINGERPRINTS:
          return await runTask(
            makePullFingerprintsRequest({ repositoryId: repository.id })
          );
      }
    } catch (error) {
      console.error(error);
    }
  }, [repository, type, runTask]);

  if (repository == null) {
    return null;
  }

  return (
    <FlatPane className={className} {...other}>
      <PaneHeader>
        <Title
          text={messages.title}
          variant="subtitle"
          className={classes.title}
        />
      </PaneHeader>
      <div className={classes.runner}>
        <FormControl variant="outlined" fullWidth size="small">
          <InputLabel id="task-select-label">{messages.task}</InputLabel>
          <Select
            labelId="task-select-label"
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
          </Select>
        </FormControl>
        <Button
          className={classes.runButton}
          color="primary"
          variant="contained"
          onClick={handleRun}
        >
          <PlayArrowOutlinedIcon />
          {messages.runTask}
        </Button>
      </div>
    </FlatPane>
  );
}

export default RepoTasksPane;
