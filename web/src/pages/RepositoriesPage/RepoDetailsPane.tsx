import React, { useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Theme, Tooltip } from "@material-ui/core";
import { useParams } from "react-router";
import { EntityPageURLParams } from "../../routing/routes";
import { Repository, RepositoryType } from "../../model/VideoFile";
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

const useStyles = makeStyles<Theme>((theme) => ({
  repoDetailsPane: {},
  title: {
    marginLeft: theme.spacing(2),
  },
  action: {
    marginLeft: theme.spacing(1),
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

const repository: Repository = {
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
};

type RepoDetailsPaneProps = {
  className?: string;
};

function RepoDetailsPane(props: RepoDetailsPaneProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { id } = useParams<EntityPageURLParams>();
  const showRepositories = useShowRepositoriesPage();
  const editRepository = useEditRepository();
  const handleEdit = useCallback(() => editRepository(id), [id]);

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
        <Tooltip title={messages.edit}>
          <IconButton size="small" onClick={handleEdit}>
            <EditOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={messages.delete}>
          <IconButton size="small" className={classes.action}>
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </Tooltip>
      </PaneHeader>
      <RepositoryAttributes
        repository={repository}
        className={classes.attributes}
      />
    </FlatPane>
  );
}

export default RepoDetailsPane;
