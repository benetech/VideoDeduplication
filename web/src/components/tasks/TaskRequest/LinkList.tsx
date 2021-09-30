import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>({
  links: {
    paddingInlineStart: 0,
  },
  link: {
    fontWeight: "normal",
  },
});

function LinkList(props: LinkListProps): JSX.Element {
  const { links, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(className)} {...other}>
      <ul className={classes.links}>
        {links?.map((link) => (
          <li key={link} className={classes.link}>
            <a href={link}>{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

type LinkListProps = {
  /**
   * Links list.
   */
  links: string[];
  className?: string;
};
export default LinkList;
