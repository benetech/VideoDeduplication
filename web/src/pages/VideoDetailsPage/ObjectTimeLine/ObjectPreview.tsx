import React, { useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { Template, TemplateMatch } from "../../../model/Template";
import ButtonBase from "@material-ui/core/ButtonBase";
import { useIntl } from "react-intl";
import { objectTime } from "./helpers/objectTime";
import TemplateIconViewer from "../../../components/templates/TemplateIcon/TemplateIconViewer";

const useStyles = makeStyles<Theme>((theme) => ({
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

function useMessages(object: TemplateMatch) {
  const intl = useIntl();
  const time = objectTime(object, intl);
  return {
    label: intl.formatMessage(
      {
        id: "actions.seekToTheObject",
      },
      {
        object: object.template?.name || "?",
        time,
      }
    ),
  };
}
/**
 * A small preview for recognized object. Allows to jump to the object location.
 */

function ObjectPreview(props: ObjectPreviewProps): JSX.Element {
  const { object, template, onSelect, autoFocus = false, className } = props;
  const classes = useStyles();
  const messages = useMessages(object);
  const intl = useIntl();
  const time = objectTime(object, intl);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus) {
      ref.current?.focus();
    }
  }, [autoFocus]);

  const handleJump = useCallback(() => {
    if (onSelect != null) {
      onSelect(object);
    }
  }, [object]);

  return (
    <ButtonBase
      className={clsx(classes.preview, className)}
      onClick={handleJump}
      focusRipple
      aria-label={messages.label}
      ref={ref}
    >
      <TemplateIconViewer icon={template?.icon} className={classes.icon} />
      <div className={classes.time}>{time}</div>
    </ButtonBase>
  );
}

type ObjectPreviewProps = {
  /**
   * Recognized object
   */
  object: TemplateMatch;

  /**
   * Template associated with the object.
   */
  template: Template;

  /**
   * Handle click on object
   */
  onSelect?: (match: TemplateMatch) => void;

  /**
   * Auto-focus item when shown
   */
  autoFocus?: boolean;
  className?: string;
};
export default ObjectPreview;
