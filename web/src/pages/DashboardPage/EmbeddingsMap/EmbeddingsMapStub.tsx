import React, { useCallback, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, Theme } from "@material-ui/core";
import { EmbeddingAlgorithm } from "../../../model/embeddings";
import useTilesTask from "../../../application/api/embeddings/useTilesTask";
import { useShowTask } from "../../../routing/hooks";
import useRunTask from "../../../application/api/tasks/useRunTask";
import { makeGenerateTilesRequest } from "../../../model/Task";
import Button from "../../../components/basic/Button";
import { useIntl } from "react-intl";
import embeddingAlgoName from "../../../lib/messages/embeddingAlgoName";
import useInvalidateTilesInfo from "../../../application/api/embeddings/useInvalidateTilesInfo";
import TaskSummary from "../../../components/tasks/TaskSummary";

const useStyles = makeStyles<Theme>((theme) => ({
  embeddingsMapStub: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    ...theme.mixins.title2,
    color: theme.palette.action.textInactive,
    margin: theme.spacing(2),
  },
  prompt: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    margin: theme.spacing(2),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    build: intl.formatMessage({ id: "actions.build" }),
    show: intl.formatMessage({ id: "actions.show" }),
    missing: (algorithm: EmbeddingAlgorithm) =>
      intl.formatMessage(
        { id: "embeddings.missing" },
        { algorithm: embeddingAlgoName(algorithm) }
      ),
    building: (algorithm: EmbeddingAlgorithm, progress: number) => {
      const progressText = `${(progress * 100).toFixed(1)}%`;
      return intl.formatMessage(
        { id: "embeddings.building" },
        { algorithm: embeddingAlgoName(algorithm), progress: progressText }
      );
    },
  };
}

type EmbeddingsMapStubProps = {
  algorithm: EmbeddingAlgorithm;
  loading?: boolean;
  className?: string;
};

export default function EmbeddingsMapStub(
  props: EmbeddingsMapStubProps
): JSX.Element {
  const { className, algorithm, loading = true } = props;
  const classes = useStyles();
  const messages = useMessages();
  const task = useTilesTask(algorithm);
  const showTask = useShowTask();
  const runTask = useRunTask();
  const invalidateInfo = useInvalidateTilesInfo(algorithm);

  useEffect(() => {
    if (task == null) {
      invalidateInfo().catch(console.error);
    }
  }, [task?.status]);

  const onShow = useCallback(() => {
    if (task != null) {
      showTask(task);
    }
  }, [task]);

  const onRun = useCallback(
    () => runTask(makeGenerateTilesRequest({ algorithm, force: true })),
    [algorithm]
  );

  let content: JSX.Element;
  if (loading) {
    content = <CircularProgress />;
  } else if (task) {
    content = (
      <div className={classes.prompt}>
        <TaskSummary task={task} className={classes.summary}>
          <TaskSummary.Progress />
        </TaskSummary>
        <Button onClick={onShow} color="secondary">
          {messages.show.toUpperCase()}
        </Button>
      </div>
    );
  } else {
    content = (
      <div className={classes.prompt}>
        <div className={classes.description}>{messages.missing(algorithm)}</div>
        <Button onClick={onRun} color="primary" variant="contained">
          {messages.build}
        </Button>
      </div>
    );
  }

  return (
    <div className={clsx(classes.embeddingsMapStub, className)}>{content}</div>
  );
}
