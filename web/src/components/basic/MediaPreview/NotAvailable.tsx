import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ErrorOutlineOutlinedIcon from "@material-ui/icons/ErrorOutlineOutlined";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>(() => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    // See "Diagonal Stripes" at http://www.heropatterns.com/
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40" +
      " 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23edecf0' fill-o" +
      "pacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V2" +
      "0L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
  },
  description: {},
}));
/**
 * Get i18n text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    description: intl.formatMessage({
      id: "preview.notAvailable",
    }),
  };
}

function NotAvailable(props: NotAvailableProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  const messages = useMessages();
  return (
    <div className={clsx(classes.root, className)}>
      <ErrorOutlineOutlinedIcon />
      <div className={classes.description}>{messages.description}</div>
    </div>
  );
}

type NotAvailableProps = {
  className?: string;
};
export default NotAvailable;
