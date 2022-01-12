import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import { useParams } from "react-router";
import { EntityPageURLParams } from "../../routing/routes";
import useRepository from "../../application/api/repositories/useRepository";
import PaneHeader from "../../components/basic/PaneHeader/PaneHeader";
import Title from "../../components/basic/Title";
import FlatPane from "../../components/basic/FlatPane/FlatPane";
import { useIntl } from "react-intl";
import { TaskRequestType } from "../../model/Task";
import PlayArrowOutlinedIcon from "@material-ui/icons/PlayArrowOutlined";
import Button from "../../components/basic/Button";
import useRunTask from "../../application/api/tasks/useRunTask";
import RepoTaskSelect from "../../components/remote/RepoTaskSelect";
import RepoTaskForm, {
  makeRepoRequest,
  RepoTaskRequest,
  validateRepoRequest,
} from "../../components/remote/RepoTaskForm";
import useContributorsAll from "../../application/api/repositories/useContributorsAll";

const useStyles = makeStyles<Theme>((theme) => ({
  runner: {
    display: "flex",
    alignItems: "center",
  },
  runButton: {
    marginLeft: theme.spacing(1),
  },
  form: {
    marginTop: theme.spacing(4),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "actions.executeTasks" }),
    runTask: intl.formatMessage({ id: "actions.runTask" }),
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
  const { contributors } = useContributorsAll({
    repositoryId: repository?.id || 0,
  });

  const runTask = useRunTask();
  const [type, setType] = useState<RepoTaskRequest["type"]>(
    TaskRequestType.PULL_FINGERPRINTS
  );
  const [request, setRequest] = useState<RepoTaskRequest>(
    makeRepoRequest(repository, type)
  );
  const [valid, setValid] = useState<boolean>(validateRepoRequest(request));

  const handleSelect = useCallback(
    (type: RepoTaskRequest["type"]) => {
      setType(type);
      setRequest(makeRepoRequest(repository, type));
    },
    [repository]
  );

  useEffect(() => setRequest(makeRepoRequest(repository, type)), [repository]);
  useEffect(() => setValid(validateRepoRequest(request)), [request]);

  const handleRun = useCallback(() => runTask(request), [request, runTask]);

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
        <RepoTaskSelect
          repository={repository}
          type={type}
          onChange={handleSelect}
        />
        <Button
          className={classes.runButton}
          color="primary"
          variant="contained"
          onClick={handleRun}
          disabled={!valid}
        >
          <PlayArrowOutlinedIcon />
          {messages.runTask}
        </Button>
      </div>
      <RepoTaskForm
        repository={repository}
        contributors={contributors}
        request={request}
        onChange={setRequest}
        className={classes.form}
      />
    </FlatPane>
  );
}

export default RepoTasksPane;
