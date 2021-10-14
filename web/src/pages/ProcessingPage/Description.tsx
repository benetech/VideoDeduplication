import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";

const useStyles = makeStyles<Theme>((theme) => ({
  description: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    color: theme.palette.primary.main,
    margin: theme.spacing(2),
  },
  text: {
    maxWidth: 230,
    ...theme.mixins.descriptionText,
    color: theme.palette.action.textInactive,
  },
}));

function useMessages() {
  const intl = useIntl();
  return {
    description: intl.formatMessage({
      id: "processing.pageDescription",
    }),
  };
}

function Description(props: DescriptionProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  const messages = useMessages();
  return (
    <div className={clsx(classes.description, className)}>
      <LockOutlinedIcon className={classes.icon} />
      <div className={classes.text}>{messages.description}</div>
    </div>
  );
}

type DescriptionProps = {
  className?: string;
};
export default Description;
