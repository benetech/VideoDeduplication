import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import Marked from "./Marked";

const useStyles = makeStyles<Theme>((theme) => ({
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
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 0,
  },
  attrName: { ...theme.mixins.captionText, marginBottom: theme.spacing(0.4) },
  valueTitle: { ...theme.mixins.title4, fontWeight: "bold" },
  valueNormal: { ...theme.mixins.valueNormal },
  valueHighlighted: {
    ...theme.mixins.valueHighlighted,
    color: theme.palette.primary.main,
  },
  valueTitleSmall: { ...theme.mixins.title4, fontWeight: "bold" },
  valueNormalSmall: { ...theme.mixins.valueNormalSmall },
  valueHighlightedSmall: {
    ...theme.mixins.valueNormalSmall,
    color: theme.palette.primary.main,
  },
  ellipsis: { ...theme.mixins.textEllipsis, minWidth: 0 },
}));

function AttributeText(props: AttributeTextProps): JSX.Element {
  const {
    icon: Icon,
    name,
    value,
    defaultValue = "NONE",
    variant = "normal",
    size = "medium",
    highlighted: highlightedText,
    ellipsis = false,
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
  const valueClass = clsx({
    [normal]: variant === "normal",
    [title]: variant === "title",
    [highlighted]: variant === "primary",
    [classes.ellipsis]: ellipsis,
  });

  if (Icon != null) {
    if (name != null) {
      return (
        <div className={clsx(classes.container, className)}>
          <Icon className={classes.icon} />
          <div className={classes.attribute}>
            <div className={classes.attrName}>{name}</div>
            <Marked mark={highlightedText} className={valueClass}>
              {value || defaultValue}
            </Marked>
          </div>
        </div>
      );
    } else {
      return (
        <div className={clsx(classes.container, className)}>
          <Icon className={classes.icon} />
          <Marked
            mark={highlightedText}
            className={clsx(classes.attribute, valueClass)}
          >
            {value || defaultValue}
          </Marked>
        </div>
      );
    }
  } else {
    if (name != null) {
      return (
        <div className={clsx(className)}>
          <div className={classes.attrName}>{name}</div>
          <Marked mark={highlightedText} className={valueClass}>
            {value || defaultValue}
          </Marked>
        </div>
      );
    } else {
      return (
        <Marked mark={highlightedText} className={clsx(valueClass, className)}>
          {value || defaultValue}
        </Marked>
      );
    }
  }
}

type ExpectedIconProps = {
  className?: string;
};

type AttributeTextProps = {
  icon?:
    | React.ComponentClass<ExpectedIconProps>
    | React.FunctionComponent<ExpectedIconProps>;
  name?: string;
  value?: string;
  defaultValue?: string;
  variant?: "title" | "normal" | "primary";
  size?: "small" | "medium";
  highlighted?: string;
  ellipsis?: boolean;
  className?: string;
};
export default AttributeText;
