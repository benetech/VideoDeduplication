import React, { useCallback, useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles<Theme>(() => ({
  root: {
    color: "#bbbbbb",
  },
}));

function InfoButton(props: InfoButtonProps): JSX.Element {
  const { text, className } = props;
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const handleTooltipOpen = useCallback(() => setOpen(true), []);
  const handleTooltipClose = useCallback(() => setOpen(false), []);
  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <div className={clsx(classes.root, className)}>
        <Tooltip
          arrow
          PopperProps={{
            disablePortal: true,
          }}
          onClose={handleTooltipClose}
          open={open}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          title={text}
        >
          <IconButton onClick={handleTooltipOpen} size="small" color="inherit">
            <InfoOutlinedIcon color="inherit" fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </ClickAwayListener>
  );
}

type InfoButtonProps = {
  /**
   * Tooltip text to be displayed.
   */
  text: string;
  className?: string;
};
export default InfoButton;
