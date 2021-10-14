import React from "react";
import { VideoFile } from "../../../model/VideoFile";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import { useIntl } from "react-intl";
import MainAttribute from "./MainAttribute";
import usePopup from "../../../lib/hooks/usePopup";
import { Popover, Theme } from "@material-ui/core";
import FullName from "../../basic/FullName";
import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import { SvgIconTypeMap } from "@material-ui/core/SvgIcon/SvgIcon";
import { ColorVariant } from "../../../lib/types/ColorVariant";

const useStyles = makeStyles<Theme>((theme) => ({
  name: {
    cursor: "pointer",
  },
  fullName: {
    margin: theme.spacing(1),
  },
}));
/**
 * Get i18n text.
 */

function useMessages() {
  const intl = useIntl();
  return {
    filename: intl.formatMessage({
      id: "file.attr.name",
    }),
  };
}

function Name(props: FileNameProps): JSX.Element | null {
  const {
    file,
    highlight,
    color = "primary",
    icon = VideocamOutlinedIcon,
    className,
    ...other
  } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { clickTrigger, popup } = usePopup<HTMLDivElement>("name-popup");

  if (file == null) {
    return null;
  }

  return (
    <>
      <MainAttribute
        name={messages.filename}
        value={file.filename}
        icon={icon}
        color={color}
        highlight={highlight}
        className={clsx(classes.name, className)}
        {...clickTrigger}
        {...other}
      />
      <Popover {...popup}>
        <FullName name={file.filename} className={classes.fullName} />
      </Popover>
    </>
  );
}

export type FileNameProps = {
  /**
   * Video file to be summarized.
   */
  file?: VideoFile;

  /**
   * Highlight substring.
   */
  highlight?: string;

  /**
   * Color variant
   */
  color?: ColorVariant;

  /**
   * Icon to be displayed
   */
  icon?: OverridableComponent<SvgIconTypeMap> | null;
  className?: string;
};
export default Name;
