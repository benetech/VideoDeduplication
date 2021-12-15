import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import { useParams } from "react-router";
import { EntityPageURLParams } from "../../routing/routes";
import { Repository, RepositoryType } from "../../model/VideoFile";
import FlatPane from "../../components/basic/FlatPane/FlatPane";
import Title from "../../components/basic/Title";
import PaneHeader from "../../components/basic/PaneHeader/PaneHeader";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import IconButton from "@material-ui/core/IconButton";
import { useShowRepositoriesPage } from "../../routing/hooks";
import repoAttrs from "../../components/remote/RepositoryPreview/repoAttrs";
import AttributeTable from "../../components/basic/AttributeTable";

const useStyles = makeStyles<Theme>((theme) => ({
  repoDetailsPane: {},
  title: {
    marginLeft: theme.spacing(2),
  },
}));

type RepoDetailsPaneProps = {
  className?: string;
};

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

function RepoDetailsPane(props: RepoDetailsPaneProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const { id } = useParams<EntityPageURLParams>();
  const showRepositories = useShowRepositoriesPage();

  return (
    <FlatPane className={className} {...other}>
      <PaneHeader>
        <IconButton onClick={showRepositories} size="small">
          <ArrowBackOutlinedIcon />
        </IconButton>
        <Title
          text={repository.name}
          variant="subtitle"
          className={classes.title}
        />
      </PaneHeader>
      <AttributeTable
        value={repository}
        attributes={repoAttrs}
        className={classes.attributes}
      />
    </FlatPane>
  );
}

export default RepoDetailsPane;
