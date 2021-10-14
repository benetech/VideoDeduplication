import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { TemplateMatch } from "../../../model/Template";
import Popper from "@material-ui/core/Popper";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import ObjectPreview from "./ObjectPreview";
import useTemplateIndex from "../../../application/api/templates/useTemplateIndex";
import { PopperProps } from "@material-ui/core/Popper/Popper";

const useStyles = makeStyles<Theme>((theme) => ({
  content: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1),
    boxShadow: "none",
    maxHeight: 200,
    overflow: "auto",
  },
  popper: {
    marginTop: theme.spacing(0.5),
    boxShadow: "0 2px 14px 0 rgba(0,0,0,0.18)",
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: "-0.9em",
      width: "3em",
      height: "1em",
      "&::before": {
        borderWidth: "0 1em 1em 1em",
        borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
      },
    },
  },
  preview: {
    marginBottom: theme.spacing(1),
  },
  arrow: {
    color: "#fff",
    position: "absolute",
    fontSize: 7,
    width: "3em",
    height: "3em",
    "&::before": {
      content: '""',
      margin: "auto",
      display: "block",
      width: 0,
      height: 0,
      borderStyle: "solid",
    },
  },
}));

function ObjectGroupPopper(props: ObjectGroupPopperProps): JSX.Element {
  const { objects, onClose, onSelect, className, onKeyClose, ...other } = props;
  const classes = useStyles();
  const templates = useTemplateIndex();
  const [focusIndex, setFocusIndex] = useState(0);
  const [arrowRef, setArrowRef] = useState<HTMLSpanElement | null>(null);
  const handleKeyDown = useCallback(
    (event) => {
      const key = event.key;

      if (key === "ArrowDown") {
        event.preventDefault();
        setFocusIndex(Math.min(focusIndex + 1, objects.length - 1));
      } else if (key === "ArrowUp") {
        event.preventDefault();
        setFocusIndex(Math.max(focusIndex - 1, 0));
      } else if (key === "Escape" || key === "Tab") {
        event.preventDefault();
        onKeyClose();
        onClose();
      }
    },
    [focusIndex, objects.length, onKeyClose, onClose]
  );
  return (
    <Popper
      {...other}
      modifiers={{
        arrow: {
          enabled: true,
          element: arrowRef,
        },
      }}
      className={classes.popper}
    >
      <span className={classes.arrow} ref={setArrowRef} />
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          className={clsx(classes.content, className)}
          onKeyDown={handleKeyDown}
        >
          {objects.map((object, index) => {
            const template = templates.get(object.templateId);
            if (template == null) {
              return null;
            }
            return (
              <ObjectPreview
                object={object}
                template={template}
                onSelect={onSelect}
                key={object.id}
                autoFocus={index === focusIndex}
                className={clsx(index < objects.length - 1 && classes.preview)}
              />
            );
          })}
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}

type ObjectGroupPopperProps = Omit<PopperProps, "children" | "onSelect"> & {
  /**
   * Objects comprising the group.
   */
  objects: TemplateMatch[];

  /**
   * Callback to handle click on object
   */
  onSelect: (object: TemplateMatch) => void;

  /**
   * On close triggered by keyboard
   */
  onKeyClose: () => void;

  /**
   * On popper close.
   */
  onClose: () => void;
  className?: string;
};
export default ObjectGroupPopper;
