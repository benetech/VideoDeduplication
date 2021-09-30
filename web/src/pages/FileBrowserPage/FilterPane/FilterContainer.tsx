import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import InfoButton from "../../../components/basic/InfoButton";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {},
  header: {
    display: "flex",
  },
  title: {
    ...theme.mixins.title4,
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
    flexGrow: 2,
  },
}));
/**
 * Common layout for titled filters.
 */

function FilterContainer(props: FilterContainerProps): JSX.Element {
  const { title, tooltip, children, className, ...other } = props;
  const classes = useStyles();
  let info: JSX.Element | null = null;

  if (tooltip) {
    info = <InfoButton text={tooltip} />;
  }

  return (
    <div className={clsx(classes.root, className)} {...other}>
      <div className={classes.header}>
        <div className={classes.title}>{title}</div>
        {info}
      </div>
      <div>{children}</div>
    </div>
  );
}

type FilterContainerProps = {
  /**
   * FilterContainer title.
   */
  title: string;

  /**
   * Optional filter tooltip
   */
  tooltip?: string;

  /**
   * FilterContainer content.
   */
  children?: React.ReactNode;
  className?: string;
};
export default FilterContainer;
