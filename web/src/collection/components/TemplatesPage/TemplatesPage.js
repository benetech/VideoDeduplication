import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import Title from "../../../common/components/Title";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import PlaylistAddCheckOutlinedIcon from "@material-ui/icons/PlaylistAddCheckOutlined";
import { IconButton, Tooltip } from "@material-ui/core";
import Spacer from "../../../common/components/Spacer";
import Button from "../../../common/components/Button";
import AddOutlinedIcon from "@material-ui/icons/AddOutlined";
import TaskSidebar from "../ProcessingPage/TaskSidebar";
import NavigateNextOutlinedIcon from "@material-ui/icons/NavigateNextOutlined";
import { randomTemplates } from "../../../server-api/MockServer/fake-data/templates";
import TemplateList from "./TemplateList";
import useTemplateAPI from "./useTemplateAPI";

const useStyles = makeStyles((theme) => ({
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
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "templates.myTemplates" }),
    process: intl.formatMessage({ id: "templates.process" }),
    addTemplate: intl.formatMessage({ id: "actions.addTemplate" }),
    showTasks: intl.formatMessage({ id: "actions.showTasks" }),
    hideTasks: intl.formatMessage({ id: "actions.hideTasks" }),
    runTemplateMatching: intl.formatMessage({
      id: "actions.runTemplateMatching",
    }),
  };
}

function TemplatesHeader(props) {
  const { onAddTemplate, onShowTasks, tasksShown, className, ...other } = props;
  const messages = useMessages();

  return (
    <Title text={messages.title} className={className} {...other}>
      <Button color="primary" variant="contained" onClick={onAddTemplate}>
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

TemplatesHeader.propTypes = {
  onAddTemplate: PropTypes.func.isRequired,
  onShowTasks: PropTypes.func.isRequired,
  tasksShown: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

function TasksHeader(props) {
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

TasksHeader.propTypes = {
  /**
   * Handle task close.
   */
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};

const defaultTemplates = [...randomTemplates({ count: 3 })];

function ProcessingPage(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [showTasks, setShowTasks] = useState(true);
  const handleShowTasks = useCallback(() => setShowTasks(true));
  const handleHideTasks = useCallback(() => setShowTasks(false));

  // Get templates API
  const {
    templates,
    onDeleteExample,
    onAddExamples,
    onChange,
    onAddTemplate,
  } = useTemplateAPI(defaultTemplates);

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={clsx(classes.column, classes.templates)}>
        <TemplatesHeader
          onAddTemplate={onAddTemplate}
          onShowTasks={handleShowTasks}
          tasksShown={showTasks}
        />
        <TemplateList>
          {templates.map((template) => (
            <TemplateList.Item
              key={template.id}
              template={template}
              onChange={onChange}
              onAddExamples={onAddExamples}
              onDeleteExample={onDeleteExample}
            />
          ))}
        </TemplateList>
      </div>
      {showTasks && (
        <div className={clsx(classes.column, classes.tasks)}>
          <TasksHeader onClose={handleHideTasks} />
          <TaskSidebar />
          <Button variant="contained" color="primary">
            {messages.runTemplateMatching}
            <NavigateNextOutlinedIcon />
          </Button>
        </div>
      )}
    </div>
  );
}

ProcessingPage.propTypes = {
  className: PropTypes.string,
};

export default ProcessingPage;
