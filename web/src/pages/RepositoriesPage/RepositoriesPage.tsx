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
    <PageLayout {...other}>
      <PageContent>
        <PageHeader title={messages.title}>
          <SidebarToggle
            sidebar={showTasks}
            onToggle={setShowTasks}
            tooltip={messages.showTasks}
          />
        </PageHeader>
        <PageBody>
          <RepoListPane perRow={showTasks ? 2 : 3} />
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
