import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { GridSize, Theme } from "@material-ui/core";
import PaneHeader from "../../components/basic/PaneHeader/PaneHeader";
import Title from "../../components/basic/Title";
import InfoButton from "../../components/basic/InfoButton";
import Grid from "@material-ui/core/Grid";
import RepositoryPreview from "../../components/remote/RepositoryPreview";
import AddRepoPlaceholder from "../../components/remote/AddRepoPlaceholder";
import FlatPane from "../../components/basic/FlatPane/FlatPane";
import { Repository, RepositoryType } from "../../model/VideoFile";
import { useIntl } from "react-intl";
import {
  useShowCreateRepositoryPage,
  useEditRepository,
  useShowRepository,
} from "../../routing/hooks";

const useStyles = makeStyles<Theme>((theme) => ({
  repoListPane: {},
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

type RepoListPaneProps = {
  perRow?: 2 | 3;
  className?: string;
};

function RepoListPane(props: RepoListPaneProps): JSX.Element {
  const { perRow = 3, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  const showRepository = useShowRepository();
  const editRepository = useEditRepository();
  const createRepository = useShowCreateRepositoryPage();

  return (
    <FlatPane className={className} {...other}>
      <PaneHeader>
        <Title text={messages.repositories} variant="subtitle">
          <InfoButton text={messages.repositoriesHelp} />
        </Title>
      </PaneHeader>
      <Grid container spacing={4} className={classes.repos}>
        {repos.map((repo) => (
          <Grid key={repo.id} xs={(12 / perRow) as GridSize} item>
            <RepositoryPreview
              repository={repo}
              onShow={showRepository}
              onEdit={editRepository}
            />
          </Grid>
        ))}
        <Grid xs={(12 / perRow) as GridSize} item>
          <AddRepoPlaceholder onClick={createRepository} />
        </Grid>
      </Grid>
    </FlatPane>
  );
}

export default RepoListPane;
