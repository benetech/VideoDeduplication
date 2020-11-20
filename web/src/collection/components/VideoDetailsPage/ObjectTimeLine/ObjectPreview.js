import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ObjectType from "../../../prop-types/ObjectType";
import ButtonBase from "@material-ui/core/ButtonBase";
import { useIntl } from "react-intl";
import { objectKind, objectTime } from "./helpers";

const useStyles = makeStyles((theme) => ({
  preview: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    paddingRight: theme.spacing(1),
  },
  time: {
    cursor: "pointer",
  },
}));

/**
 * Get i18n text
 */
function useMessages(object) {
  const intl = useIntl();
  const time = objectTime(object);
  const kind = objectKind(object);
  const name = intl.formatMessage({ id: kind.name });
  return {
    label: intl.formatMessage(
      { id: "actions.seekToTheObject" },
      { object: name, time }
    ),
  };
}

/**
 * A small preview for recognized object. Allows to jump to the object location.
 */
function ObjectPreview(props) {
  const { object, onJump, autoFocus = false, className } = props;
  const classes = useStyles();
  const messages = useMessages(object);

  const Icon = objectKind(object).icon;
  const time = objectTime(object);
  const ref = useRef();

  useEffect(() => {
    if (autoFocus) {
      ref.current.focus();
    }
  }, [autoFocus]);

  return (
    <ButtonBase
      className={clsx(classes.preview, className)}
      onClick={() => onJump(object)}
      focusRipple
      disableTouchRipple
      aria-label={messages.label}
      ref={ref}
    >
      <Icon className={classes.icon} />
      <div className={classes.time}>{time}</div>
    </ButtonBase>
  );
}

ObjectPreview.propTypes = {
  /**
   * Recognized object
   */
  object: ObjectType.isRequired,
  /**
   * Handle click on object
   */
  onJump: PropTypes.func,
  /**
   * Auto-focus item when shown
   */
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
};

export default ObjectPreview;
