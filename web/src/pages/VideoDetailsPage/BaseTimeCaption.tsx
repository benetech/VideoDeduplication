import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import AccessTimeOutlinedIcon from "@material-ui/icons/AccessTimeOutlined";
import { formatDuration } from "../../lib/helpers/format";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>((theme) => ({
  position: {
    ...theme.mixins.textSmall,
    color: theme.palette.common.white,
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: theme.spacing(0.5),
  },
}));
/**
 * Represent a time position inside a video file.
 */

function BaseTimeCaption<
  ComponentProps extends BaseTimeCaptionExpectedContainerProps = React.HTMLProps<HTMLDivElement>
>(props: BaseTimeCaptionProps<ComponentProps>): JSX.Element {
  const {
    time,
    className,
    component: Component = "div",
    componentProps,
  } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <Component
      className={clsx(classes.position, className)}
      {...componentProps}
    >
      <AccessTimeOutlinedIcon className={classes.icon} fontSize="inherit" />
      {formatDuration(time, intl, false)}
    </Component>
  );
}

export type BaseTimeCaptionExpectedContainerProps = {
  className?: string;
  children?: React.ReactNode;
};

export type BaseTimeCaptionProps<
  ComponentProps extends BaseTimeCaptionExpectedContainerProps = React.HTMLProps<HTMLDivElement>
> = {
  time: number;
  component: React.ComponentType<ComponentProps> | string;
  componentProps: ComponentProps;
  className?: string;
};

export default BaseTimeCaption;
