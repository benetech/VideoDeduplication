import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme, Tooltip } from "@material-ui/core";
import ButtonBase from "@material-ui/core/ButtonBase";

const useStyles = makeStyles<Theme>((theme) => ({
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

function PreviewMainAction(props: PreviewMainActionProps): JSX.Element {
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
  const handleCloseAck = useCallback(() => setShowAck(false), []);
  const handleOpenAck = useCallback(() => null, []);
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

type PreviewMainActionProps = {
  /**
   * Action title.
   */
  name: string;

  /**
   * Action handler.
   */
  onFire: (...args: any[]) => void;

  /**
   * Acknowledgement text which will be displayed on action fire.
   */
  ack?: string;

  /**
   * Amount of time to show acknowledgement message in milliseconds.
   */
  ackDuration?: number;
  className?: string;
};
export default PreviewMainAction;
