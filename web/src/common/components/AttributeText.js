import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Marked from "./Marked";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  attribute: {
    display: "flex",
    flexDirection: "column",
  },
  attrName: {
    ...theme.mixins.captionText,
    marginBottom: theme.spacing(0.4),
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
  valueTitleSmall: {
    ...theme.mixins.title4,
    fontWeight: "bold",
  },
  valueNormalSmall: {
    ...theme.mixins.valueNormalSmall,
  },
  valueHighlightedSmall: {
    ...theme.mixins.valueNormalSmall,
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
    size = "medium",
    highlighted: highlightedText,
    className,
  } = props;

  const classes = useStyles();

  const normal =
    size === "medium" ? classes.valueNormal : classes.valueNormalSmall;

  const highlighted =
    size === "medium"
      ? classes.valueHighlighted
      : classes.valueHighlightedSmall;

  const title =
    size === "medium" ? classes.valueTitle : classes.valueTitleSmall;

  return (
    <div className={clsx(classes.container, className)}>
      {Icon != null && <Icon className={classes.icon} />}
      <div className={classes.attribute}>
        {name != null && <div className={classes.attrName}>{name}</div>}
        <div
          className={clsx({
            [normal]: variant === "normal",
            [title]: variant === "title",
            [highlighted]: variant === "primary",
          })}
        >
          <Marked mark={highlightedText}>{value || defaultValue}</Marked>
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
  variant: PropTypes.oneOf(["title", "normal", "primary"]),
  size: PropTypes.oneOf(["small", "medium"]),
  highlighted: PropTypes.string,
  className: PropTypes.string,
};

export default AttributeText;
