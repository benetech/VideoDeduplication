import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  links: {
    paddingInlineStart: 0,
  },
  link: {
    fontWeight: "normal",
  },
});

function LinkList(props) {
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

LinkList.propTypes = {
  /**
   * Links list.
   */
  links: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  className: PropTypes.string,
};

export default LinkList;
