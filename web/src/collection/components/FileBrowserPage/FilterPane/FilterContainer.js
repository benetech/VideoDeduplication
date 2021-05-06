import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import InfoButton from "../../../../common/components/InfoButton";

const useStyles = makeStyles((theme) => ({
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
function FilterContainer(props) {
  const { title, tooltip, children, className, ...other } = props;
  const classes = useStyles();

  let info = null;
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

FilterContainer.propTypes = {
  /**
   * FilterContainer title.
   */
  title: PropTypes.string.isRequired,
  /**
   * Optional filter tooltip
   */
  tooltip: PropTypes.string,
  /**
   * FilterContainer content.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default FilterContainer;
