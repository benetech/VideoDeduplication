import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import AttributeText from "../../basic/AttributeText";

const useStyles = makeStyles((theme) => ({
  hashContainer: {
    flexGrow: 1,
    flexShrink: 1,
    display: "flex",
    alignItems: "center",
    minWidth: 0,
  },
  iconContainer: {
    backgroundColor: ({ color }) => theme.palette[color].main,
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.spacing(0.5),
    marginRight: theme.spacing(3),
    flexShrink: 0,
  },
  icon: {
    color: ({ color }) => theme.palette[color].contrastText,
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
  },
  attribute: {
    minWidth: 0,
  },
}));

const MainAttribute = React.forwardRef(function MainAttribute(props, ref) {
  const {
    name,
    value,
    icon: Icon,
    highlight,
    color = "primary",
    className,
    ...other
  } = props;
  const classes = useStyles({ color });

  return (
    <div
      className={clsx(classes.hashContainer, className)}
      ref={ref}
      {...other}
    >
      {Icon && (
        <div className={classes.iconContainer}>
          <Icon className={classes.icon} />
        </div>
      )}
      <AttributeText
        name={name}
        value={value}
        highlighted={highlight}
        variant="title"
        ellipsis
        className={classes.attribute}
      />
    </div>
  );
});

MainAttribute.propTypes = {
  /**
   * Attribute name.
   */
  name: PropTypes.string.isRequired,
  /**
   * Attribute value.
   */
  value: PropTypes.string.isRequired,
  /**
   * Highlight substring.
   */
  highlight: PropTypes.string,
  /**
   * Icon element type.
   */
  icon: PropTypes.elementType,
  /**
   * Color variant
   */
  color: PropTypes.oneOf(["primary", "secondary"]),
  className: PropTypes.string,
};

export default MainAttribute;
