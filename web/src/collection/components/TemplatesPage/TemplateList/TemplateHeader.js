import React, { useCallback, useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { TemplateType } from "../../../prop-types/TemplateType";
import { useIntl } from "react-intl";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import ChevronRightOutlinedIcon from "@material-ui/icons/ChevronRightOutlined";
import MoreVertOutlinedIcon from "@material-ui/icons/MoreVertOutlined";
import IconButton from "@material-ui/core/IconButton";
import Spacer from "../../../../common/components/Spacer";
import Button from "../../../../common/components/Button";
import TemplateTitle from "./TemplateTitle";
import TemplateIconPreview from "./TemplateIconPreview";
import usePopup from "../../../../common/hooks/usePopup";
import { Menu, MenuItem } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
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
  exampleCount: {
    ...theme.mixins.text,
    color: theme.palette.primary.main,
  },
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
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    examples(count) {
      if (count === 1) {
        return intl.formatMessage({ id: "templates.examples.one" });
      }
      const countText = String(count).padStart(2, "0");
      return intl.formatMessage(
        { id: "templates.examples.many" },
        { count: countText }
      );
    },
    edit: intl.formatMessage({ id: "actions.edit" }),
    done: intl.formatMessage({ id: "actions.done" }),
    editIcon: intl.formatMessage({ id: "actions.editIcon" }),
    deleteTemplate: intl.formatMessage({ id: "actions.deleteTemplate" }),
    onShowMatches: intl.formatMessage({ id: "actions.showMatchedFiles" }),
  };
}

function useActions({ messages, onShowMatches, onDelete, template }) {
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

function bindHandler(popup) {
  return (action) => () => {
    popup.onClose();
    action.handler();
  };
}

function TemplateHeader(props) {
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
  const { clickTrigger, popup } = usePopup("template-actions-");
  const actions = useActions({ messages, onShowMatches, onDelete, template });
  const handle = bindHandler(popup);

  const handleExpand = useCallback(() => onExpandChange(!expanded), [
    expanded,
    onExpandChange,
  ]);

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
      <div className={classes.exampleCount}>
        {messages.examples(template?.examples?.length)}
      </div>
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

TemplateHeader.propTypes = {
  /**
   * Template described by the header.
   */
  template: TemplateType.isRequired,
  /**
   * Enable edit-mode.
   */
  edit: PropTypes.bool,
  /**
   * Handle edit-mode change.
   */
  onEditChange: PropTypes.func.isRequired,
  /**
   * Handle template icon change.
   */
  onIconChange: PropTypes.func.isRequired,
  /**
   * Handle template name change.
   */
  onNameChange: PropTypes.func.isRequired,
  /**
   * Indicates example list is expanded.
   */
  expanded: PropTypes.bool,
  /**
   * Handle expansion change.
   */
  onExpandChange: PropTypes.func.isRequired,
  /**
   * Handle show template matches.
   */
  onShowMatches: PropTypes.func.isRequired,
  /**
   * Handle delete template.
   */
  onDelete: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default TemplateHeader;
