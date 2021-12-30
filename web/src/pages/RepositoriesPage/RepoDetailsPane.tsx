import React, { useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Theme, Tooltip } from "@material-ui/core";
import { useParams } from "react-router";
import { EntityPageURLParams } from "../../routing/routes";
import FlatPane from "../../components/basic/FlatPane/FlatPane";
import Title from "../../components/basic/Title";
import PaneHeader from "../../components/basic/PaneHeader/PaneHeader";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import IconButton from "@material-ui/core/IconButton";
import {
  useEditRepository,
  useShowRepositoriesPage,
} from "../../routing/hooks";
import RepositoryAttributes from "../../components/remote/RepositoryAttributes";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import Spacer from "../../components/basic/Spacer";
import { useIntl } from "react-intl";
import useRepository from "../../application/api/repositories/useRepository";
import LoadingStatus from "../../components/basic/LoadingStatus";
import useDeleteRepoDialog from "./useDeleteRepoDialog";
import { useSyncRepository } from "../../application/api/repositories/useRepositoryAPI";
import SyncButton from "./SyncButton";

const useStyles = makeStyles<Theme>((theme) => ({
  repoDetailsPane: {},
  title: {
    marginLeft: theme.spacing(2),
  },
  action: {
    marginLeft: theme.spacing(1),
  },
  loadingHeader: {
    marginBottom: 0,
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    edit: intl.formatMessage({ id: "repos.action.edit" }),
    delete: intl.formatMessage({ id: "repos.action.delete" }),
    back: intl.formatMessage({ id: "actions.goBack" }),
  };
}

type RepoDetailsPaneProps = {
  className?: string;
};

function RepoDetailsPane(props: RepoDetailsPaneProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { id } = useParams<EntityPageURLParams>();
  const { repository, error, load } = useRepository(Number(id));
  const showRepositories = useShowRepositoriesPage();
  const editRepository = useEditRepository();
  const handleEdit = useCallback(() => editRepository(id), [id]);
  const deleteRepoDialog = useDeleteRepoDialog({ onSuccess: showRepositories });
  const handleDelete = useCallback(
    () => deleteRepoDialog.handleOpen(repository),
    [repository]
  );

  const syncHandler = useSyncRepository();
  const syncRepo = useCallback(async () => {
    if (repository != null) {
      syncHandler.syncRepo(repository).catch(console.error);
    }
  }, [repository]);

  if (repository == null) {
    return (
      <FlatPane className={className} {...other}>
        <PaneHeader className={classes.loadingHeader}>
          <Tooltip title={messages.back}>
            <IconButton onClick={showRepositories} size="small">
              <ArrowBackOutlinedIcon />
            </IconButton>
          </Tooltip>
          <LoadingStatus
            error={error}
            onRetry={load}
            variant="subtitle"
            className={classes.title}
          />
          <Spacer />
        </PaneHeader>
      </FlatPane>
    );
  }

  return (
    <FlatPane className={className} {...other}>
      <PaneHeader>
        <Tooltip title={messages.back}>
          <IconButton onClick={showRepositories} size="small">
            <ArrowBackOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Title
          text={repository.name}
          variant="subtitle"
          className={classes.title}
        />
        <Spacer />
        <SyncButton onClick={syncRepo} loading={syncHandler.loading} />
        <Tooltip title={messages.edit}>
          <IconButton
            size="small"
            className={classes.action}
            onClick={handleEdit}
          >
            <EditOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={messages.delete}>
          <IconButton
            size="small"
            className={classes.action}
            onClick={handleDelete}
          >
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </Tooltip>
      </PaneHeader>
      <RepositoryAttributes
        repository={repository}
        className={classes.attributes}
      />
      {deleteRepoDialog.dialog}
    </FlatPane>
  );
}

export default RepoDetailsPane;
