import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  attribute: {
    minWidth: "inherit",
    maxWidth: "inherit",
    display: "flex",
    flexDirection: "column",
  },
  attrName: {
    ...theme.mixins.captionText,
    marginBottom: theme.spacing(0.4),
    minWidth: "inherit",
    maxWidth: "inherit",
  },
  value: {
    minWidth: "inherit",
    maxWidth: "inherit",
  },
  overflowWrap: {
    wordBreak: "break-word",
  },
  overflowEllipsisStart: {
    textAlign: "left",
    direction: "rtl",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  overflowEllipsisEnd: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  valueTitle: {
    ...theme.mixins.title4,
    fontWeight: "bold",
  },
  valueNormal: {
    ...theme.mixins.valueNormal,
  },
  valueHighlighted: {
    ...theme.mixins.valueHighlighted,
    color: theme.palette.primary.main,
  },
}));

function AttributeText(props) {
  const {
    icon: Icon,
    name,
    value,
    defaultValue = "NONE",
    variant = "normal",
    overflow = "none",
    className,
  } = props;

  const classes = useStyles();

  return (
    <div className={clsx(classes.container, className)}>
      {Icon != null && <Icon className={classes.icon} />}
      <div className={classes.attribute}>
        {name != null && <div className={classes.attrName}>{name}</div>}
        <div
          className={clsx(classes.value, {
            [classes.valueNormal]: variant === "normal",
            [classes.valueTitle]: variant === "title",
            [classes.valueHighlighted]: variant === "primary",
            [classes.overflowWrap]: overflow === "wrap",
            [classes.overflowEllipsisStart]: overflow === "ellipsis-start",
            [classes.overflowEllipsisEnd]: overflow === "ellipsis-end",
          })}
        >
          {value || defaultValue}
        </div>
      </div>
    </div>
  );
}

AttributeText.propTypes = {
  icon: PropTypes.elementType,
  name: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  overflow: PropTypes.oneOf(["none", "wrap", "ellipsis-start", "ellipsis-end"]),
  variant: PropTypes.oneOf(["title", "normal", "primary"]),
  className: PropTypes.string,
};

export default AttributeText;
