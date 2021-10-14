import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { IconButton, Theme, Tooltip } from "@material-ui/core";
import { useIntl } from "react-intl";
import Title from "../../components/basic/Title";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import PlaylistAddCheckOutlinedIcon from "@material-ui/icons/PlaylistAddCheckOutlined";
import Spacer from "../../components/basic/Spacer";
import Button from "../../components/basic/Button";
import AddOutlinedIcon from "@material-ui/icons/AddOutlined";
import TaskSidebar from "../ProcessingPage/TaskSidebar";
import NavigateNextOutlinedIcon from "@material-ui/icons/NavigateNextOutlined";
import TemplateList from "../../components/templates/TemplateList";
import AddTemplateDialog from "./AddTemplateDialog";
import useFilesColl from "../../application/api/files/useFilesColl";
import { useShowCollection } from "../../routing/hooks";
import useTemplateAPI from "../../application/api/templates/useTemplateAPI";
import useRunTask from "../../application/api/tasks/useRunTask";
import useTemplatesAll from "../../application/api/templates/useTemplatesAll";
import {
  makeMatchTemplatesRequest,
  Task,
  TaskRequestType,
} from "../../model/Task";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 3,
    minWidth: theme.dimensions.collectionPage.width,
    display: "flex",
    alignItems: "stretch",
  },
  templates: {
    flexGrow: 1,
  },
  tasks: {
    marginLeft: theme.spacing(4),
    maxWidth: 380,
  },
  description: {
    flexGrow: 1,
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  addButton: {
    flexShrink: 0,
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({
      id: "templates.myTemplates",
    }),
    process: intl.formatMessage({
      id: "templates.process",
    }),
    addTemplate: intl.formatMessage({
      id: "actions.addTemplate",
    }),
    showTasks: intl.formatMessage({
      id: "actions.showTasks",
    }),
    hideTasks: intl.formatMessage({
      id: "actions.hideTasks",
    }),
    runTemplateMatching: intl.formatMessage({
      id: "actions.runTemplateMatching",
    }),
  };
}

function TemplatesHeader(props: TemplatesHeaderProps) {
  const { onAddTemplate, onShowTasks, tasksShown, className, ...other } = props;
  const messages = useMessages();
  const classes = useStyles();
  return (
    <Title text={messages.title} className={className} {...other}>
      <Button
        className={classes.addButton}
        color="primary"
        variant="contained"
        onClick={onAddTemplate}
      >
        <AddOutlinedIcon />
        {messages.addTemplate}
      </Button>
      <Spacer />
      {!tasksShown && (
        <Tooltip title={messages.showTasks}>
          <IconButton
            color="inherit"
            onClick={onShowTasks}
            aria-label={messages.showTasks}
          >
            <PlaylistAddCheckOutlinedIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
      )}
    </Title>
  );
}

type TemplatesHeaderProps = {
  onAddTemplate: () => void;
  onShowTasks: () => void;
  tasksShown: boolean;
  className?: string;
};

function TasksHeader(props: TasksHeaderProps) {
  const { onClose, className, ...other } = props;
  const messages = useMessages();
  return (
    <Title text={messages.process} className={className} {...other}>
      <Spacer />
      <Tooltip title={messages.hideTasks}>
        <IconButton
          color="inherit"
          onClick={onClose}
          aria-label={messages.hideTasks}
        >
          <CloseOutlinedIcon color="inherit" fontSize="large" />
        </IconButton>
      </Tooltip>
    </Title>
  );
}

type TasksHeaderProps = {
  /**
   * Handle task close.
   */
  onClose: () => void;
  className?: string;
};

function TemplatesPage(props: TemplatesPageProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const handleShowTasks = useCallback(() => setShowTasks(true), []);
  const handleHideTasks = useCallback(() => setShowTasks(false), []);
  const collection = useFilesColl();
  const showCollection = useShowCollection();
  const { templates } = useTemplatesAll();
  const api = useTemplateAPI();
  const runTask = useRunTask();
  const matchTemplates = useCallback(
    () => runTask(makeMatchTemplatesRequest()),
    []
  );
  const showTemplateDialog = useCallback(
    () => setShowNewTemplateDialog(true),
    []
  );
  const hideTemplateDialog = useCallback(
    () => setShowNewTemplateDialog(false),
    []
  );
  const filterTemplateTasks = useCallback((task: Task): boolean => {
    const type = task.request?.type;
    return (
      type === TaskRequestType.MATCH_TEMPLATES ||
      type === TaskRequestType.FIND_FRAME
    );
  }, []);
  const showMatches = useCallback((template) => {
    collection.updateParams({
      templates: [template.id],
    });
    showCollection();
  }, []);
  const handleProcess = useCallback(() => {
    setLoading(true);
    matchTemplates()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={clsx(classes.column, classes.templates)}>
        <TemplatesHeader
          onAddTemplate={showTemplateDialog}
          onShowTasks={handleShowTasks}
          tasksShown={showTasks}
        />
        <TemplateList>
          {templates.map((template) => (
            <TemplateList.Item
              key={template.id}
              template={template}
              onChange={api.updateTemplate}
              onAddExamples={api.uploadExamples}
              onDeleteExample={api.deleteExample}
              onDelete={api.deleteTemplate}
              onShowMatches={showMatches}
            />
          ))}
        </TemplateList>
      </div>
      {showTasks && (
        <div className={clsx(classes.column, classes.tasks)}>
          <TasksHeader onClose={handleHideTasks} />
          <TaskSidebar filter={filterTemplateTasks} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleProcess}
            disabled={loading}
          >
            {messages.runTemplateMatching}
            <NavigateNextOutlinedIcon />
          </Button>
        </div>
      )}
      <AddTemplateDialog
        open={showNewTemplateDialog}
        onClose={hideTemplateDialog}
      />
    </div>
  );
}

type TemplatesPageProps = {
  className?: string;
};
export default TemplatesPage;
