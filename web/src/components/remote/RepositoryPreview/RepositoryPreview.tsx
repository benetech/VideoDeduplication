import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, ListItemIcon, Theme, Typography } from "@material-ui/core";
import OutlinedCard from "../../basic/OutlinedCard";
import Spacer from "../../basic/Spacer";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import Title from "../../basic/Title";
import { Repository } from "../../../model/VideoFile";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import usePopup from "../../../lib/hooks/usePopup";
import { useIntl } from "react-intl";
import ButtonBase from "@material-ui/core/ButtonBase";
import { ButtonBaseProps } from "@material-ui/core/ButtonBase/ButtonBase";
import LaunchOutlinedIcon from "@material-ui/icons/LaunchOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import CloudDownloadOutlinedIcon from "@material-ui/icons/CloudDownloadOutlined";
import CloudUploadOutlinedIcon from "@material-ui/icons/CloudUploadOutlined";
import { safeTimeDistance } from "../../../lib/messages/safeTimeDistance";
import { Nullable } from "../../../lib/types/util-types";
import RepoProgress from "../RepoProgress";

const useStyles = makeStyles<Theme>((theme) => ({
  repositoryPreview: {
    width: "100%",
    height: "100%",
    borderRadius: theme.spacing(1),
  },
  card: {
    padding: theme.spacing(2),
    width: "100%",
    height: "100%",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  title: {},
  subtitle: {
    color: theme.palette.secondary.light,
    marginBottom: theme.spacing(3),
  },
  select: {
    cursor: "pointer",
  },
  attributes: {
    width: "auto",
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    select: intl.formatMessage({ id: "actions.showDetails" }),
    edit: intl.formatMessage({ id: "actions.edit" }),
    delete: intl.formatMessage({ id: "actions.delete" }),
    push: intl.formatMessage({ id: "repos.action.shareFingerprints" }),
    pull: intl.formatMessage({ id: "repos.action.pullFingerprints" }),
    lastSynced(time: Nullable<Date>): string {
      return intl.formatMessage(
        { id: "repos.attr.lastSynced.dist" },
        { distance: safeTimeDistance(time, intl) }
      );
    },
  };
}

type RepoListItemProps = ButtonBaseProps<"div"> & {
  selected?: boolean;
  onShow?: (repo: Repository) => void;
  onEdit?: (repo: Repository) => void;
  onDelete?: (repo: Repository) => void;
  onPushFingerprints?: (repo: Repository) => void;
  onPullFingerprints?: (repo: Repository) => void;
  repository: Repository;
  className?: string;
};

function RepositoryPreview(props: RepoListItemProps): JSX.Element {
  const {
    onShow,
    onDelete,
    onEdit,
    onPushFingerprints,
    onPullFingerprints,
    repository,
    className,
    ...other
  } = props;

  const classes = useStyles();
  const messages = useMessages();
  const { clickTrigger, popup } = usePopup<HTMLButtonElement>();

  const handleSelect = useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
      popup.onClose();
      if (onShow != null) onShow(repository);
    },
    [repository, onShow]
  );

  const handleEdit = useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
      popup.onClose();
      if (onEdit != null) onEdit(repository);
    },
    [repository, onEdit]
  );

  const handleDelete = useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
      popup.onClose();
      if (onDelete != null) onDelete(repository);
    },
    [repository, onDelete]
  );

  const handlePush = useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
      popup.onClose();
      if (onPushFingerprints != null) onPushFingerprints(repository);
    },
    [repository, onPushFingerprints]
  );

  const handlePull = useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
      popup.onClose();
      if (onPullFingerprints != null) onPullFingerprints(repository);
    },
    [repository, onPullFingerprints]
  );

  const openMenu = useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
      clickTrigger.onClick();
    },
    [clickTrigger.onClick]
  );

  const closeMenu = useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
      popup.onClose();
    },
    [popup.onClose]
  );

  const stopPropagation = useCallback(
    (event: React.SyntheticEvent) => event.stopPropagation(),
    []
  );

  return (
    <ButtonBase
      focusRipple
      component="div"
      className={clsx(classes.repositoryPreview, className)}
      {...other}
    >
      <OutlinedCard
        className={classes.card}
        border="lean"
        onClick={handleSelect}
      >
        <Title
          text={repository.name}
          className={classes.title}
          variant="card"
          ellipsis
        >
          <Spacer />
          <IconButton
            size="small"
            {...clickTrigger}
            onClick={openMenu}
            onMouseDown={stopPropagation}
          >
            <MoreHorizOutlinedIcon fontSize="small" />
          </IconButton>
        </Title>
        <div className={classes.subtitle}>
          {messages.lastSynced(repository.lastSynced)}
        </div>
        <RepoProgress repository={repository} />
        <Menu {...popup} onClose={closeMenu}>
          <MenuItem onClick={handleSelect} onMouseDown={stopPropagation}>
            <ListItemIcon>
              <LaunchOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">{messages.select}</Typography>
          </MenuItem>
          <MenuItem onClick={handleEdit} onMouseDown={stopPropagation}>
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">{messages.edit}</Typography>
          </MenuItem>
          <MenuItem onClick={handleDelete} onMouseDown={stopPropagation}>
            <ListItemIcon>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">{messages.delete}</Typography>
          </MenuItem>
          <MenuItem onClick={handlePush} onMouseDown={stopPropagation}>
            <ListItemIcon>
              <CloudUploadOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">{messages.push}</Typography>
          </MenuItem>
          <MenuItem onClick={handlePull} onMouseDown={stopPropagation}>
            <ListItemIcon>
              <CloudDownloadOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">{messages.pull}</Typography>
          </MenuItem>
        </Menu>
      </OutlinedCard>
    </ButtonBase>
  );
}

export default RepositoryPreview;
