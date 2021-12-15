import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import TasksSidebarHeader from "../../components/tasks/TasksSidebarHeader";
import TaskSidebar from "../ProcessingPage/TaskSidebar";
import RepositoriesPageHeader from "./RepositoriesPageHeader";
import FlatPane from "../../components/basic/FlatPane/FlatPane";
import Title from "../../components/basic/Title";
import { useIntl } from "react-intl";
import InfoButton from "../../components/basic/InfoButton";
import PaneHeader from "../../components/basic/PaneHeader/PaneHeader";
import { Repository, RepositoryType } from "../../model/VideoFile";
import RepositoryPreview from "../../components/remote/RepositoryPreview";
import Grid from "@material-ui/core/Grid";
import AddRepoPlaceholder from "../../components/remote/AddRepoPlaceholder";

const useStyles = makeStyles<Theme>((theme) => ({
  repositoriesPage: {
    padding: theme.dimensions.content.padding,
    paddingTop: theme.dimensions.content.padding * 3,
    minWidth: theme.dimensions.collectionPage.width,
    display: "flex",
    alignItems: "stretch",
  },
  content: {
    flexGrow: 1,
  },
  tasks: {
    marginLeft: theme.spacing(4),
    maxWidth: 380,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  repos: {
    width: "100%",
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    repositories: intl.formatMessage({ id: "repos.fingerprintRepositories" }),
    repositoriesHelp: intl.formatMessage({
      id: "repos.fingerprintRepositories.help",
    }),
  };
}

const repos: Repository[] = [
  {
    id: 1,
    name: "Repository Name",
    type: RepositoryType.BARE_DATABASE,
    address: "some address",
    login: "MyLogin",
    lastSynced: new Date(),
    stats: {
      partnersCount: 5,
      fingerprintsCount: 4567,
    },
  },
  {
    id: 2,
    name: "Repository Name 2",
    type: RepositoryType.BARE_DATABASE,
    address: "some address",
    login: "MyLogin",
    lastSynced: new Date(),
    stats: {
      partnersCount: 3,
      fingerprintsCount: 5367,
    },
  },
  {
    id: 3,
    name: "Repository Name 3",
    type: RepositoryType.BARE_DATABASE,
    address: "some address",
    login: "MyLogin",
    lastSynced: new Date(),
    stats: {
      partnersCount: 7,
      fingerprintsCount: 7567,
    },
  },
];

type RepositoriesPageProps = {
  className?: string;
};

function RepositoriesPage(props: RepositoriesPageProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  const [showTasks, setShowTasks] = useState(true);
  const handleShowTasks = useCallback(() => setShowTasks(true), []);
  const handleHideTasks = useCallback(() => setShowTasks(false), []);

  return (
    <div className={clsx(classes.repositoriesPage, className)} {...other}>
      <div className={clsx(classes.column, classes.content)}>
        <RepositoriesPageHeader
          showTasks={showTasks}
          onShowTasks={handleShowTasks}
          className={classes.header}
        />
        <FlatPane>
          <PaneHeader>
            <Title text={messages.repositories} variant="subtitle">
              <InfoButton text={messages.repositoriesHelp} />
            </Title>
          </PaneHeader>
          <Grid container spacing={4} className={classes.repos}>
            {repos.map((repo) => (
              <Grid key={repo.id} xs={showTasks ? 6 : 4} item>
                <RepositoryPreview
                  repository={repo}
                  onClick={console.log}
                  onSelect={console.log}
                />
              </Grid>
            ))}
            <Grid xs={showTasks ? 6 : 4} item>
              <AddRepoPlaceholder />
            </Grid>
          </Grid>
        </FlatPane>
      </div>
      {showTasks && (
        <div className={clsx(classes.column, classes.tasks)}>
          <TasksSidebarHeader
            onClose={handleHideTasks}
            className={classes.header}
          />
          <TaskSidebar />
        </div>
      )}
    </div>
  );
}

export default RepositoriesPage;
