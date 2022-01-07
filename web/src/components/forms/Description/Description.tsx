import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  description: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    ...theme.mixins.text,
    color: "#505050",
  },
  descriptionTitle: {
    ...theme.mixins.title3,
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
  },
}));

function Description(props: DescriptionProps): JSX.Element {
  const { text, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(className)} {...other}>
      <div className={classes.descriptionTitle}>Description</div>
      <div className={classes.description}>{text}</div>
    </div>
  );
}

type DescriptionProps = {
  /**
   * Description text.
   */
  text: string;
  className?: string;
};
export default Description;
