import React, { useCallback, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
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
import PageLayout from "../../components/page-layout/PageLayout";
import PageHeader from "../../components/page-layout/PageHeader";
import SidebarToggle from "../../components/page-layout/SidebarToggle";
import PageBody from "../../components/page-layout/PageBody";
import PageContent from "../../components/page-layout/PageContent";
import SidebarHeader from "../../components/page-layout/SidebarHeader";
import SidebarContent from "../../components/page-layout/SidebarContent";
import Sidebar from "../../components/page-layout/Sidebar";

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
  header: {
    marginBottom: theme.spacing(3),
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

type TemplatesPageProps = {
  className?: string;
};

export default function TemplatesPage(props: TemplatesPageProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
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
    <PageLayout className={className} {...other}>
      <PageContent>
        <PageHeader title={messages.title}>
          <Button
            className={classes.addButton}
            color="primary"
            variant="contained"
            onClick={showTemplateDialog}
          >
            <AddOutlinedIcon />
            {messages.addTemplate}
          </Button>
          <SidebarToggle
            sidebar={showTasks}
            onToggle={setShowTasks}
            tooltip={messages.showTasks}
          />
        </PageHeader>
        <PageBody>
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
        </PageBody>
        <AddTemplateDialog
          open={showNewTemplateDialog}
          onClose={hideTemplateDialog}
        />
      </PageContent>
      <Sidebar show={showTasks}>
        <SidebarHeader title={messages.process} onToggle={setShowTasks} />
        <SidebarContent sticky>
          <TaskSidebar filter={filterTemplateTasks}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleProcess}
              disabled={loading}
            >
              {messages.runTemplateMatching}
              <NavigateNextOutlinedIcon />
            </Button>
          </TaskSidebar>
        </SidebarContent>
      </Sidebar>
    </PageLayout>
  );
}
