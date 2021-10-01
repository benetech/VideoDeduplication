import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { ButtonBase, Chip, Theme } from "@material-ui/core";
import { Template } from "../../../../../model/Template";
import TemplateIconViewer from "../../../../templates/TemplateIcon/TemplateIconViewer";
import TemplateTitle from "../../../../templates/TemplateList/TemplateTitle";
import Spacer from "../../../../basic/Spacer";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
    borderWidth: 3,
    borderRadius: theme.spacing(1),
    borderColor: theme.palette.border.light,
    borderStyle: "solid",
    padding: theme.spacing(1),
    cursor: "pointer",
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  count: {},
}));
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
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

function MatchedTemplate(props: MatchedTemplateProps): JSX.Element | null {
  const { template, fileCount, onClick, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const handleClick = useCallback(() => {
    if (onClick != null && template != null) {
      onClick(template);
    }
  }, [template]);

  if (template == null) {
    return null;
  }

  return (
    <ButtonBase
      className={clsx(classes.container, className)}
      focusRipple
      onClick={handleClick}
      {...other}
    >
      <TemplateIconViewer icon={template.icon} className={classes.icon} />
      <TemplateTitle name={template.name} />
      <Spacer />
      <Chip
        clickable
        color="secondary"
        variant="default"
        label={messages.matchedFiles(fileCount)}
        className={classes.count}
      />
    </ButtonBase>
  );
}

type MatchedTemplateProps = {
  /**
   * Matched template.
   */
  template?: Template;

  /**
   * Count of matched files.
   */
  fileCount: number;

  /**
   * Handle template click.
   */
  onClick?: (...args: any[]) => void;
  className?: string;
};
export default MatchedTemplate;
