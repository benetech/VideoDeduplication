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
import { useIntl } from "react-intl";
import {
  useEditRepository,
  useShowCreateRepositoryPage,
  useShowRepository,
} from "../../routing/hooks";
import useRepositoriesAll from "../../application/api/repositories/useRepositoriesAll";
import useDeleteRepoDialog from "./useDeleteRepoDialog";

const useStyles = makeStyles<Theme>({
  repoListPane: {},
});

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

type RepoListPaneProps = {
  perRow?: 2 | 3;
  className?: string;
};

function RepoListPane(props: RepoListPaneProps): JSX.Element {
  const { perRow = 3, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { repositories } = useRepositoriesAll();

  const showRepository = useShowRepository();
  const editRepository = useEditRepository();
  const createRepository = useShowCreateRepositoryPage();
  const deleteRepoDialog = useDeleteRepoDialog();

  return (
    <FlatPane className={className} {...other}>
      <PaneHeader>
        <Title text={messages.repositories} variant="subtitle">
          <InfoButton text={messages.repositoriesHelp} />
        </Title>
      </PaneHeader>
      <Grid container spacing={4} className={classes.repos}>
        {repositories.map((repo) => (
          <Grid key={repo.id} xs={(12 / perRow) as GridSize} item>
            <RepositoryPreview
              repository={repo}
              onShow={showRepository}
              onEdit={editRepository}
              onDelete={deleteRepoDialog.handleOpen}
            />
          </Grid>
        ))}
        <Grid xs={(12 / perRow) as GridSize} item>
          <AddRepoPlaceholder onClick={createRepository} />
        </Grid>
      </Grid>
      {deleteRepoDialog.dialog}
    </FlatPane>
  );
}

export default RepoListPane;
