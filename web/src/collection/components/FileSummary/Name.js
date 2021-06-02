import React from "react";
import PropTypes from "prop-types";
import { FileType } from "../../prop-types/FileType";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import { useIntl } from "react-intl";
import MainAttribute from "./MainAttribute";
import usePopup from "../../../common/hooks/usePopup";
import { Popover } from "@material-ui/core";
import FullName from "../../../common/components/FullName";
import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
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
    filename: intl.formatMessage({ id: "file.attr.name" }),
  };
}

function Name(props) {
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
  const { clickTrigger, popup } = usePopup("name-popup");

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

Name.propTypes = {
  /**
   * Video file to be summarized.
   */
  file: FileType,
  /**
   * Highlight substring.
   */
  highlight: PropTypes.string,
  /**
   * Color variant
   */
  color: PropTypes.oneOf(["primary", "secondary"]),
  /**
   * Icon to be displayed
   */
  icon: PropTypes.elementType,
  className: PropTypes.string,
};

export default Name;
