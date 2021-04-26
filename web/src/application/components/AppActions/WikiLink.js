import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { ButtonBase, Tooltip } from "@material-ui/core";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  wikiLink: {
    fontFamily: "Roboto",
    fontSize: 15,
    letterSpacing: 0,
    cursor: "pointer",
    color: theme.palette.action.textInactive,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    wiki: intl.formatMessage({ id: "app.action.wiki" }),
    wikiLabel: intl.formatMessage({ id: "aria.label.openWiki" }),
  };
}

function WikiLink(props) {
  const { onClick, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  return (
    <Tooltip title={messages.wikiLabel}>
      <ButtonBase
        className={clsx(classes.wikiLink, className)}
        focusRipple
        onClick={onClick}
        aria-label={messages.wikiLabel}
        {...other}
      >
        {messages.wiki}
      </ButtonBase>
    </Tooltip>
  );
}

WikiLink.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default WikiLink;
