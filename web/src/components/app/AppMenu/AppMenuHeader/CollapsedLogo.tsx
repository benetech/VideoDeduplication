import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import PlusPlusIcon from "./PlusPlusIcon";
import Label from "../../../basic/Label";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>(() => ({
  logo: {
    display: "flex",
    flexDirection: "column",
  },
  icon: {
    width: 30,
  },
  title: {
    marginTop: -2,
  },
}));

function CollapsedLogo(props: CollapsedLogoProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <div className={clsx(classes.logo, className)}>
      <PlusPlusIcon className={classes.icon} />
      <Label variant="title2" color="primary" className={classes.title}>
        {intl.formatMessage({
          id: "app.title.short",
        })}
      </Label>
    </div>
  );
}

type CollapsedLogoProps = {
  className?: string;
};
export default CollapsedLogo;
