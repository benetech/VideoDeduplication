import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ObjectType from "../../../../prop-types/ObjectType";
import ButtonBase from "@material-ui/core/ButtonBase";
import { useIntl } from "react-intl";
import { objectTime } from "./helpers";
import TemplateIcon from "../../TemplatesPage/TemplateIcon/TemplateIcon";

const useStyles = makeStyles((theme) => ({
  preview: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: theme.spacing(1),
    width: 15,
    height: 15,
    fontSize: 15,
  },
  time: {
    fontSize: 15,
    cursor: "pointer",
  },
}));

/**
 * Get i18n text
 */
function useMessages(object) {
  const intl = useIntl();
  const time = objectTime(object);
  return {
    label: intl.formatMessage(
      { id: "actions.seekToTheObject" },
      { object: object.name, time }
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
      aria-label={messages.label}
      ref={ref}
    >
      <TemplateIcon icon={object.template?.icon} className={classes.icon} />
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
