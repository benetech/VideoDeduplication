import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme, Tooltip } from "@material-ui/core";
import { useIntl } from "react-intl";
import IconButton from "@material-ui/core/IconButton";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  name: {
    borderStyle: "solid",
    borderRadius: theme.spacing(0.5),
    borderWidth: 1,
    borderColor: theme.palette.divider,
    background: theme.palette.grey[100],
    marginLeft: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    copy: intl.formatMessage({
      id: "actions.copyName",
    }),
  };
}

function FullName(props: FullNameProps): JSX.Element {
  const { name, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(name).catch((error) =>
      console.error("Copy name failed", error, {
        error,
      })
    );
  }, [name]);
  const handleSelect = useCallback((event) => {
    const range = document.createRange();
    range.selectNode(event.target);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
  }, []);
  return (
    <div className={clsx(classes.container, className)} {...other}>
      <Tooltip title={messages.copy}>
        <IconButton onClick={handleCopy}>
          <FileCopyOutlinedIcon />
        </IconButton>
      </Tooltip>
      <div onClick={handleSelect} className={classes.name}>
        {name}
      </div>
    </div>
  );
}

type FullNameProps = {
  /**
   * Name to be displayed.
   */
  name: string;
  className?: string;
};
export default FullName;
