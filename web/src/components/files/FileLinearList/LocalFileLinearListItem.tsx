import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme, useMediaQuery } from "@material-ui/core";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import IconButton from "@material-ui/core/IconButton";
import { useIntl } from "react-intl";
import FileSummary from "../FileSummary";
import useTheme from "@material-ui/styles/useTheme";
import { FileListItemProps } from "../FileList";

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: theme.palette.border.light,
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(3),
  },
  button: {
    cursor: "pointer",
    "&:hover": {
      borderColor: theme.palette.primary.light,
    },
  },
  summary: {
    flexGrow: 1,
    minWidth: 0,
  },
}));
/**
 * Get i18n text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    containerLabel: intl.formatMessage({
      id: "actions.showFileDetails",
    }),
    moreLabel: intl.formatMessage({
      id: "actions.showMoreOptions",
    }),
  };
}
/**
 * Get screen size.
 */

function useScreenSize() {
  const theme = useTheme<Theme>();
  const medium = useMediaQuery(theme.breakpoints.up("md"));
  const large = useMediaQuery(theme.breakpoints.up("lg"));
  return {
    medium,
    large,
  };
}

const LocalFileLinearListItem = React.memo(function FpLocalFileLinearListItem(
  props: FileListItemProps
) {
  const {
    file,
    button = false,
    highlight,
    onClick,
    dense,
    className,
    ...other
  } = props;
  const messages = useMessages();
  const { large, medium } = useScreenSize();
  const handleClick = useCallback(() => {
    if (onClick != null) {
      onClick(file);
    }
  }, [file, onClick]);
  const classes = useStyles();
  return (
    <div
      onClick={handleClick}
      className={clsx(classes.container, button && classes.button, className)}
      aria-label={messages.containerLabel}
      data-selector="FileLinearListItem"
      data-file-id={file.id}
      {...other}
    >
      <FileSummary file={file} divider className={classes.summary}>
        <FileSummary.Name highlight={highlight} />
        {medium && <FileSummary.MatchCount />}
        <FileSummary.Duration />
        {large && !dense && <FileSummary.CreationDate />}
        {large && !dense && <FileSummary.HasAudio />}
        <IconButton aria-label={messages.moreLabel}>
          <MoreHorizOutlinedIcon />
        </IconButton>
      </FileSummary>
    </div>
  );
});

export default LocalFileLinearListItem;
