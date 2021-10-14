import React, { useCallback, useMemo } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Chip, Menu, MenuItem, Theme } from "@material-ui/core";
import { Template } from "../../../model/Template";
import { useIntl } from "react-intl";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import ChevronRightOutlinedIcon from "@material-ui/icons/ChevronRightOutlined";
import MoreVertOutlinedIcon from "@material-ui/icons/MoreVertOutlined";
import IconButton from "@material-ui/core/IconButton";
import Spacer from "../../basic/Spacer";
import Button from "../../basic/Button";
import TemplateTitle from "./TemplateTitle";
import TemplateIconPreview from "./TemplateIconPreview";
import usePopup, { PopupOptions } from "../../../lib/hooks/usePopup";
import Action from "../../../model/Action";

const useStyles = makeStyles<Theme>((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginLeft: theme.spacing(1),
  },
  title: {
    marginLeft: theme.spacing(3),
  },
  exampleCount: { ...theme.mixins.text, color: theme.palette.primary.main },
  button: {
    minWidth: 80,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
  },
  hide: {
    display: "none",
  },
  count: {
    marginRight: theme.spacing(1),
  },
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    examples(count: number) {
      if (count === 1) {
        return intl.formatMessage({
          id: "templates.examples.one",
        });
      }

      const countText = String(count).padStart(2, "0");
      return intl.formatMessage(
        {
          id: "templates.examples.many",
        },
        {
          count: countText,
        }
      );
    },

    edit: intl.formatMessage({
      id: "actions.edit",
    }),
    done: intl.formatMessage({
      id: "actions.done",
    }),
    editIcon: intl.formatMessage({
      id: "actions.editIcon",
    }),
    deleteTemplate: intl.formatMessage({
      id: "actions.deleteTemplate",
    }),
    onShowMatches: intl.formatMessage({
      id: "actions.showMatchedFiles",
    }),

    matchedFiles(count: number) {
      if (count === 1) {
        return intl.formatMessage({
          id: "templates.matchedFiles.one",
        });
      }

      return intl.formatMessage(
        {
          id: "templates.matchedFiles.many",
        },
        {
          count,
        }
      );
    },
  };
}

type UseActionsOptions = {
  messages: ReturnType<typeof useMessages>;
  onShowMatches: (template: Template) => void;
  onDelete: (template: Template) => void;
  template: Template;
};

function useActions({
  messages,
  onShowMatches,
  onDelete,
  template,
}: UseActionsOptions): Action[] {
  return useMemo(
    () => [
      {
        title: messages.deleteTemplate,
        handler: () => onDelete(template),
      },
      {
        title: messages.onShowMatches,
        handler: () => onShowMatches(template),
      },
    ],
    [onShowMatches, onDelete, template]
  );
}

function bindHandler(
  popup: PopupOptions<HTMLButtonElement>
): (action: Action) => () => void {
  return (action: Action) => () => {
    popup.onClose();
    action.handler();
  };
}

function TemplateHeader(props: TemplateHeaderProps): JSX.Element {
  const {
    template,
    edit = false,
    onEditChange,
    onIconChange,
    onNameChange,
    expanded,
    onExpandChange,
    onShowMatches,
    onDelete,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { clickTrigger, popup } =
    usePopup<HTMLButtonElement>("template-actions-");
  const actions = useActions({
    messages,
    onShowMatches,
    onDelete,
    template,
  });
  const handle = bindHandler(popup);
  const handleShowMatches = useCallback(
    () => onShowMatches(template),
    [onShowMatches, template]
  );
  const handleExpand = useCallback(
    () => onExpandChange(!expanded),
    [expanded, onExpandChange]
  );
  const ExpandIcon = expanded
    ? ExpandMoreOutlinedIcon
    : ChevronRightOutlinedIcon;
  return (
    <div className={clsx(classes.header, className)} {...other}>
      <IconButton onClick={handleExpand}>
        <ExpandIcon />
      </IconButton>
      <TemplateIconPreview
        icon={template.icon}
        edit={edit}
        onChange={onIconChange}
        className={classes.icon}
      />
      <TemplateTitle
        name={template.name}
        onChange={onNameChange}
        edit={edit}
        className={classes.title}
      />
      <Spacer />
      <Chip
        clickable
        color="primary"
        variant="outlined"
        label={messages.matchedFiles(template.fileCount || 0)}
        className={clsx(
          classes.count,
          !((template.fileCount || 0) > 0) && classes.hide
        )}
        onClick={handleShowMatches}
      />
      <Button
        className={clsx(classes.button, edit && classes.hide)}
        onClick={onEditChange}
        variant="outlined"
        color="primary"
      >
        <span>{messages.edit}</span>
      </Button>
      <Button
        className={clsx(classes.button, !edit && classes.hide)}
        onClick={onEditChange}
        variant="contained"
        color="primary"
      >
        <span>{messages.done}</span>
      </Button>
      <IconButton {...clickTrigger}>
        <MoreVertOutlinedIcon />
      </IconButton>
      <Menu {...popup}>
        {actions.map((action) => (
          <MenuItem key={action.title} onClick={handle(action)}>
            {action.title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

type TemplateHeaderProps = {
  /**
   * Template described by the header.
   */
  template: Template;

  /**
   * Enable edit-mode.
   */
  edit?: boolean;

  /**
   * Handle edit-mode change.
   */
  onEditChange: (...args: any[]) => void;

  /**
   * Handle template icon change.
   */
  onIconChange: (...args: any[]) => void;

  /**
   * Handle template name change.
   */
  onNameChange: (...args: any[]) => void;

  /**
   * Indicates example list is expanded.
   */
  expanded?: boolean;

  /**
   * Handle expansion change.
   */
  onExpandChange: (...args: any[]) => void;

  /**
   * Handle show template matches.
   */
  onShowMatches: (...args: any[]) => void;

  /**
   * Handle delete template.
   */
  onDelete: (...args: any[]) => void;
  className?: string;
};
export default TemplateHeader;
