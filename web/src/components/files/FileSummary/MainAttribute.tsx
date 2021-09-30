import React, { ForwardedRef } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import AttributeText from "../../basic/AttributeText";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import { SvgIconTypeMap } from "@material-ui/core/SvgIcon/SvgIcon";
import { ColorVariant } from "../../../lib/types/ColorVariant";

type MainAttributeStyleProps = {
  color: ColorVariant;
};

const useStyles = makeStyles<Theme, MainAttributeStyleProps>((theme) => ({
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

const MainAttribute = React.forwardRef(function MainAttribute(
  props: MainAttributeProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const {
    name,
    value,
    icon: Icon,
    highlight,
    color = "primary",
    className,
    ...other
  } = props;
  const classes = useStyles({
    color,
  });
  return (
    <div
      className={clsx(classes.hashContainer, className)}
      ref={ref}
      {...other}
    >
      {Icon != null && (
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

type MainAttributeProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * Attribute name.
   */
  name: string;

  /**
   * Attribute value.
   */
  value: string;

  /**
   * Highlight substring.
   */
  highlight?: string;

  /**
   * Icon element type.
   */
  icon?: OverridableComponent<SvgIconTypeMap> | null;

  /**
   * Color variant
   */
  color?: ColorVariant;
  className?: string;
};
export default MainAttribute;
