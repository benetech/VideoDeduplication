import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import TaskSidebar from "./TaskSidebar";
import { useIntl } from "react-intl";
import Description from "./Description";
import TaskBuilder from "../../components/tasks/TaskBuilder";
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
  },
  content: {
    display: "flex",
    alignItems: "stretch",
  },
  builder: {
    flexGrow: 1,
  },
  tasks: {
    marginLeft: theme.spacing(4),
    width: 380,
    flexShrink: 0,
  },
  description: {
    flexGrow: 1,
    flexShrink: 0,
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
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
      id: "processing.title",
    }),
    showTasks: intl.formatMessage({
      id: "actions.showTasks",
    }),
    hideTasks: intl.formatMessage({
      id: "actions.hideTasks",
    }),
  };
}

type ProcessingPageProps = {
  className?: string;
};

export default function ProcessingPage(
  props: ProcessingPageProps
): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [showTasks, setShowTasks] = useState(true);

  return (
    <PageLayout className={className} {...other}>
      <PageContent>
        <PageHeader title={messages.title}>
          <Description className={classes.description} />
          <SidebarToggle
            sidebar={showTasks}
            onToggle={setShowTasks}
            tooltip={messages.showTasks}
          />
        </PageHeader>
        <PageBody>
          <TaskBuilder className={classes.builder} />
        </PageBody>
      </PageContent>
      <Sidebar show={showTasks}>
        <SidebarHeader onToggle={setShowTasks} />
        <SidebarContent sticky>
          <TaskSidebar />
        </SidebarContent>
      </Sidebar>
    </PageLayout>
  );
}
