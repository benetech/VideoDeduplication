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

type RepositoriesPageProps = {
  className?: string;
};

function RepositoriesPage(props: RepositoriesPageProps): JSX.Element {
  const { className, ...other } = props;
  const messages = useMessages();

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
            </Route>
            <Route exact path={routes.collaborators.editRepository}>
              <RepoEditorPane />
            </Route>
          </Switch>
        </PageBody>
      </PageContent>
      <Sidebar show={showTasks}>
        <SidebarHeader title={messages.process} onToggle={setShowTasks} />
        <SidebarContent>
          <TaskSidebar />
        </SidebarContent>
      </Sidebar>
    </PageLayout>
  );
}

export default RepositoriesPage;
