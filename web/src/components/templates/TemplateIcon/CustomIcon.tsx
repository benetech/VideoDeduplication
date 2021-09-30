import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Avatar, Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import clsx from "clsx";

const useStyles = makeStyles<Theme>({
  icon: {
    width: 40,
    height: 40,
  },
});
/**
 * Get translated text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    altIcon: intl.formatMessage({
      id: "templates.icon",
    }),
  };
}
/**
 * Custom (uploaded by user) template icon.
 */

function CustomIcon(props: CustomIconProps): JSX.Element {
  const { url, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  return (
    <Avatar
      src={url}
      variant="square"
      className={clsx(classes.icon, className)}
      alt={messages.altIcon}
      {...other}
    />
  );
}

type CustomIconProps = {
  /**
   * Icon url.
   */
  url?: string;
  className?: string;
};
export default CustomIcon;
