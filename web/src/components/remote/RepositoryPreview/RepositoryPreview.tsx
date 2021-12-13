import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Theme } from "@material-ui/core";
import OutlinedCard from "../../basic/OutlinedCard";
import Spacer from "../../basic/Spacer";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import Title from "../../basic/Title";
import { Repository } from "../../../model/VideoFile";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import usePopup from "../../../lib/hooks/usePopup";
import { useIntl } from "react-intl";
import AttributeTable from "../../basic/AttributeTable";
import repoAttrs from "./repoAttrs";

const useStyles = makeStyles<Theme>((theme) => ({
  repositoryPreview: {
    padding: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  select: {
    cursor: "pointer",
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    edit: intl.formatMessage({ id: "actions.edit" }),
    delete: intl.formatMessage({ id: "actions.delete" }),
  };
}

type RepoListItemProps = {
  selected?: boolean;
  onSelect?: (repo: Repository) => void;
  repository: Repository;
  className?: string;
};

function RepositoryPreview(props: RepoListItemProps): JSX.Element {
  const { selected, onSelect, repository, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { clickTrigger, popup } = usePopup<HTMLButtonElement>();

  const handleSelect = useCallback(() => {
    if (onSelect != null) onSelect(repository);
  }, [repository, onSelect]);

  return (
    <OutlinedCard
      selected={selected}
      onClick={handleSelect}
      className={clsx(
        classes.repositoryPreview,
        onSelect && classes.select,
        className
      )}
      {...other}
    >
      <Title
        text={repository.name}
        className={classes.title}
        variant="card"
        ellipsis
      >
        <Spacer />
        <IconButton size="small" {...clickTrigger}>
          <MoreHorizOutlinedIcon fontSize="small" />
        </IconButton>
      </Title>
      <AttributeTable value={repository} attributes={repoAttrs} size="small" />
      <Menu {...popup}>
        <MenuItem onClick={console.log}>{messages.edit}</MenuItem>
        <MenuItem onClick={console.log}>{messages.delete}</MenuItem>
      </Menu>
    </OutlinedCard>
  );
}

export default RepositoryPreview;
