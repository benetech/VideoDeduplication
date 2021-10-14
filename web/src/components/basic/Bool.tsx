import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import { formatBool } from "../../lib/helpers/format";

const useStyles = makeStyles<Theme>((theme) => ({
  bool: { ...theme.mixins.valueNormal, color: theme.palette.primary.main },
}));

function Bool(props: BoolProps): JSX.Element {
  const { value = false, className } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <div className={clsx(classes.bool, className)}>
      {formatBool(value, intl)}
    </div>
  );
}

type BoolProps = {
  /**
   * Boolean value to be displayed
   */
  value?: boolean;
  className?: string;
};
export default Bool;
