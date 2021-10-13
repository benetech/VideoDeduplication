import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme, Tooltip } from "@material-ui/core";
import { TemplateExclusion } from "../../../model/Template";
import TemplateIconViewer from "../../../components/templates/TemplateIcon/TemplateIconViewer";
import Spacer from "../../../components/basic/Spacer";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>((theme) => ({
  exclusion: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(1),
    borderColor: theme.palette.border.light,
    borderStyle: "solid",
    display: "flex",
  },
  icon: {
    width: 25,
    height: 25,
    fontSize: 25,
    marginRight: theme.spacing(2),
  },
  title: {
    ...theme.mixins.title3,
    ...theme.mixins.textEllipsis,
    fontWeight: "bold",
    flexShrink: 1,
    marginRight: theme.spacing(1),
  },
}));
/**
 * Get translated text
 */

function useMessages() {
  const intl = useIntl();
  return {
    deleteTooltip: intl.formatMessage({
      id: "exclusion.delete.description",
    }),
  };
}

function ExcludedTemplate(props: ExcludedTemplateProps): JSX.Element {
  const { exclusion, onDelete, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const handleDelete = useCallback(() => onDelete(exclusion), [exclusion]);
  return (
    <div className={clsx(classes.exclusion, className)} {...other}>
      <TemplateIconViewer
        icon={exclusion.template.icon}
        className={classes.icon}
      />
      <div className={classes.title}>{exclusion.template.name}</div>
      <Spacer />
      <Tooltip title={messages.deleteTooltip}>
        <IconButton onClick={handleDelete} size="small">
          <DeleteOutlineIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
}

type ExcludedTemplateProps = {
  /**
   * Template exclusion for the given file.
   */
  exclusion: TemplateExclusion;

  /**
   * Handle deletion of exclusion.
   */
  onDelete: (exclusion: TemplateExclusion) => void;
  className?: string;
};
export default ExcludedTemplate;
