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
    alignItems: "center",
  },
  icon: {
    width: 46,
    marginRight: 9,
  },
}));

function ExpandedLogo(props: ExpandedLogoProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <div className={clsx(classes.logo, className)}>
      <PlusPlusIcon className={classes.icon} />
      <Label variant="title2" color="primary">
        {intl.formatMessage({
          id: "app.title",
        })}
      </Label>
    </div>
  );
}

type ExpandedLogoProps = {
  className?: string;
};
export default ExpandedLogo;
