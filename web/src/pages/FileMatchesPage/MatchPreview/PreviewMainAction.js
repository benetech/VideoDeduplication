import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ButtonBase from "@material-ui/core/ButtonBase";
import { Tooltip } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  mainAction: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
  },
  link: {
    ...theme.mixins.captionText,
    color: theme.palette.primary.main,
    cursor: "pointer",
  },
}));

function PreviewMainAction(props) {
  const {
    name,
    onFire,
    ack = "",
    ackDuration = 2000,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const [showAck, setShowAck] = useState(false);

  const handleAction = useCallback(() => {
    if (ack && !showAck) {
      setShowAck(true);
    }
    onFire();
  }, [onFire, ack, showAck]);

  useEffect(() => {
    if (ack && showAck) {
      const hideAck = setTimeout(() => setShowAck(false), ackDuration);
      return () => clearTimeout(hideAck);
    }
  }, [ack, showAck]);

  const handleCloseAck = useCallback(() => setShowAck(false));
  const handleOpenAck = useCallback(() => {});

  return (
    <Tooltip
      title={ack}
      open={showAck}
      onOpen={handleOpenAck}
      onClose={handleCloseAck}
    >
      <ButtonBase
        className={clsx(classes.mainAction, className)}
        onClick={handleAction}
        aria-label={name}
        focusRipple
        {...other}
      >
        <div className={classes.link}>{name}</div>
      </ButtonBase>
    </Tooltip>
  );
}

PreviewMainAction.propTypes = {
  /**
   * Action title.
   */
  name: PropTypes.string.isRequired,
  /**
   * Action handler.
   */
  onFire: PropTypes.func.isRequired,
  /**
   * Acknowledgement text which will be displayed on action fire.
   */
  ack: PropTypes.string,
  /**
   * Amount of time to show acknowledgement message in milliseconds.
   */
  ackDuration: PropTypes.number,
  className: PropTypes.string,
};

export default PreviewMainAction;
