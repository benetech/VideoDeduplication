import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../prop-types/FileType";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import AttributeText from "../../../common/components/AttributeText";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  nameContainer: {
    flexGrow: 1,
    flexShrink: 1,
    display: "flex",
    alignItems: "center",
    minWidth: 0,
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.main,
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
    color: theme.palette.primary.contrastText,
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
  },
  filename: {
    minWidth: 0,
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
  const { file, highlight, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  return (
    <div className={clsx(classes.nameContainer, className)} {...other}>
      <div className={classes.iconContainer}>
        <VideocamOutlinedIcon className={classes.icon} />
      </div>
      <AttributeText
        name={messages.filename}
        value={file.filename}
        highlighted={highlight}
        variant="title"
        ellipsis
        className={classes.filename}
      />
    </div>
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
  className: PropTypes.string,
};

export default Name;
