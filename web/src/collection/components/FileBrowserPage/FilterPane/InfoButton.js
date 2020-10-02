import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import IconButton from "@material-ui/core/IconButton";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    color: "#bbbbbb",
  },
}));

function InfoButton(props) {
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
            <InfoOutlinedIcon color="inherit" size="small" />
          </IconButton>
        </Tooltip>
      </div>
    </ClickAwayListener>
  );
}

InfoButton.propTypes = {
  /**
   * Tooltip text to be displayed.
   */
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default InfoButton;
