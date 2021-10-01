import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { ButtonBase, Theme } from "@material-ui/core";
import { TemplateMatch } from "../../../model/Template";
import { formatDuration } from "../../../lib/helpers/format";
import { IntlShape, useIntl } from "react-intl";
import position from "../objectPosition";
import ObjectPreview from "./ObjectPreview";
import useTemplateIndex from "../../../application/api/templates/useTemplateIndex";
import BaseTimeCaption from "../BaseTimeCaption";
import { ButtonBaseProps } from "@material-ui/core/ButtonBase/ButtonBase";

type ObjectGroupListItemStyleProps = {
  show?: boolean;
};

const useStyles = makeStyles<Theme, ObjectGroupListItemStyleProps>((theme) => ({
  groupListItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.dividerLight}`,
  },
  caption: {
    cursor: "pointer",
    margin: theme.spacing(1),
    padding: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  objects: {
    display: "flex",
    alignItems: "center",
  },
  object: {
    margin: theme.spacing(1),
    width: 50,
    height: 50,
    lineHeight: 1,
    "&:hover": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
    },
  },
  objectWrapper: {
    transform: "translate(0%, 0px)",
  },
  overlay: {
    position: "absolute",
    top: -5,
    right: -5,
    display: ({ show }) => (show ? "flex" : "none"),
    width: 24,
    height: 24,
    minHeight: 24,
  },
}));

/**
 * Start position of the object group
 */
function startTime(objects: TemplateMatch[]): number {
  return Math.min(...objects.map(position), 0);
}

/**
 * Get a11y label for time caption
 */
function captionLabel(objects: TemplateMatch[], intl: IntlShape): string {
  const time = formatDuration(startTime(objects), intl, false);
  return intl.formatMessage({ id: "aria.label.objectGroup" }, { time });
}

function ObjectGroupListItem(props: ObjectGroupListItemProps): JSX.Element {
  const { objects, onSelect, onDelete, className } = props;
  const intl = useIntl();
  const classes = useStyles({});
  const position = startTime(objects);
  const templates = useTemplateIndex();

  const selectFirst = useCallback(() => onSelect(objects[0]), [objects[0]]);

  return (
    <div className={clsx(classes.groupListItem, className)}>
      <BaseTimeCaption
        time={position}
        className={classes.caption}
        component={ButtonBase}
        componentProps={
          {
            onClick: selectFirst,
            focusRipple: true,
            disableTouchRipple: true,
            "aria-label": captionLabel(objects, intl),
          } as ButtonBaseProps
        }
      />
      <div className={classes.objects}>
        {objects.map((object) => {
          const template = templates.get(object.templateId);
          return (
            template != null && (
              <ObjectPreview
                object={object}
                template={template}
                onSelect={onSelect}
                onDelete={onDelete}
                key={object.id}
              />
            )
          );
        })}
      </div>
    </div>
  );
}

type ObjectGroupListItemProps = {
  /**
   * Objects comprising the group
   */
  objects: TemplateMatch[];

  /**
   * Jump to a particular object
   */
  onSelect: (object: TemplateMatch) => void;

  /**
   * Handle delete a particular object
   */
  onDelete: (object: TemplateMatch) => void;
  className?: string;
};
export default ObjectGroupListItem;
