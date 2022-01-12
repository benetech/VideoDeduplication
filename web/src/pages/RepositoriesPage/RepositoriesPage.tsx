import React, { useState } from "react";
import TaskSidebar from "../ProcessingPage/TaskSidebar";
import { useIntl } from "react-intl";
import RepoListPane from "./RepoListPane";
import PageContent from "../../components/page-layout/PageContent";
import PageHeader from "../../components/page-layout/PageHeader";
import SidebarToggle from "../../components/page-layout/SidebarToggle";
import PageBody from "../../components/page-layout/PageBody";
import Sidebar from "../../components/page-layout/Sidebar";
import SidebarHeader from "../../components/page-layout/SidebarHeader";
import SidebarContent from "../../components/page-layout/SidebarContent";
import PageLayout from "../../components/page-layout/PageLayout";
import { Route, Switch } from "react-router-dom";
import { routes } from "../../routing/routes";
import RepoDetailsPane from "./RepoDetailsPane";
import RepoConstructorPane from "./RepoConstructorPane";
import RepoEditorPane from "./RepoEditorPane";
import RepoTasksPane from "./RepoTasksPane";
import { makeStyles } from "@material-ui/core";
import { Task, TaskRequestType } from "../../model/Task";
import PartnersPane from "./PartnersPane";

const useStyles = makeStyles((theme) => ({
  bottomPane: {
    marginTop: theme.spacing(2),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "repos.shareFingerprints" }),
    showTasks: intl.formatMessage({
      id: "actions.showTasks",
    }),
    hideTasks: intl.formatMessage({
      id: "actions.hideTasks",
    }),
    process: intl.formatMessage({
      id: "templates.process",
    }),
  };
}

function repoTasks(task: Task): boolean {
  const taskType = task.request.type;
  return (
    taskType === TaskRequestType.PULL_FINGERPRINTS ||
    taskType === TaskRequestType.PUSH_FINGERPRINTS ||
    taskType === TaskRequestType.MATCH_REMOTE_FINGERPRINTS
  );
}

type RepositoriesPageProps = {
  className?: string;
};

function RepositoriesPage(props: RepositoriesPageProps): JSX.Element {
  const { className, ...other } = props;
  const messages = useMessages();
  const classes = useStyles();

  const [showTasks, setShowTasks] = useState(true);

  return (
    <PageLayout className={className} {...other}>
      <PageContent>
        <PageHeader title={messages.title}>
          <SidebarToggle
            sidebar={showTasks}
            onToggle={setShowTasks}
            tooltip={messages.showTasks}
          />
        </PageHeader>
        <PageBody>
          <Switch>
            <Route exact path={routes.collaborators.repositories}>
              <RepoListPane perRow={showTasks ? 2 : 3} />
            </Route>
            <Route exact path={routes.collaborators.newRepository}>
              <RepoConstructorPane />
            </Route>
            <Route exact path={routes.collaborators.repository}>
              <RepoDetailsPane />
              <PartnersPane className={classes.bottomPane} />
              <RepoTasksPane className={classes.bottomPane} />
            </Route>
            <Route exact path={routes.collaborators.editRepository}>
              <RepoEditorPane />
            </Route>
          </Switch>
        </PageBody>
      </PageContent>
      <Sidebar show={showTasks}>
        <SidebarHeader title={messages.process} onToggle={setShowTasks} />
        <SidebarContent sticky>
          <TaskSidebar filter={repoTasks} />
        </SidebarContent>
      </Sidebar>
    </PageLayout>
  );
}

export default RepositoriesPage;
