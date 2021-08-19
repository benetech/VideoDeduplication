import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { TemplateType } from "../../../../../prop-types/TemplateType";
import TemplateIcon from "../../../../templates/TemplateIcon/TemplateIcon";
import TemplateTitle from "../../../../templates/TemplateList/TemplateTitle";
import Spacer from "../../../../basic/Spacer";
import { ButtonBase, Chip } from "@material-ui/core";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
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
    matchedFiles(count) {
      if (count === 1) {
        return intl.formatMessage({ id: "templates.matchedFiles.one" });
      }
      return intl.formatMessage(
        { id: "templates.matchedFiles.many" },
        { count }
      );
    },
  };
}

function MatchedTemplate(props) {
  const { template, fileCount, onClick, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  const handleClick = useCallback(() => onClick(template), [template]);

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
      <TemplateIcon icon={template?.icon} className={classes.icon} />
      <TemplateTitle name={template?.name} />
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

MatchedTemplate.propTypes = {
  /**
   * Matched template.
   */
  template: TemplateType,
  /**
   * Count of matched files.
   */
  fileCount: PropTypes.number.isRequired,
  /**
   * Handle template click.
   */
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default MatchedTemplate;
