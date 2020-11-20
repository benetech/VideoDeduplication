import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileType from "../../prop-types/FileType";
import Paper from "@material-ui/core/Paper";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import { basename } from "../../../common/helpers/paths";
import { formatDuration } from "../../../common/helpers/format";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
  },
  name: {
    ...theme.mixins.textEllipsis,
    ...theme.mixins.title5,
    flexGrow: 1,
    maxWidth: 300,
    marginRight: theme.spacing(1),
  },
  icon: {
    color: theme.palette.primary.contrastText,
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(3),
    height: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: theme.spacing(1),
  },
  duration: {
    ...theme.mixins.valueNormal,
    color: theme.palette.primary.main,
  },
}));

function NodeTooltip(props) {
  const { file, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <Paper className={clsx(classes.root, className)} {...other}>
      <div className={classes.iconContainer}>
        <VideocamOutlinedIcon className={classes.icon} />
      </div>
      <div className={classes.name}>{basename(file.filename)}</div>
      <div className={classes.duration}>
        {formatDuration(file.metadata.length, intl)}
      </div>
    </Paper>
  );
}

NodeTooltip.propTypes = {
  /**
   * File to be summarized.
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default NodeTooltip;
