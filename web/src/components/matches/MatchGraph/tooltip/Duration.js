import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { formatDuration } from "../../../../lib/helpers/format";
import { useIntl } from "react-intl";
import FileType from "../../../../prop-types/FileType";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  attrValue: {
    ...theme.mixins.valueNormal,
    color: theme.palette.primary.main,
  },
}));

function Duration(props) {
  const { file, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <div className={clsx(classes.attrValue, className)} {...other}>
      {formatDuration(file.metadata.length, intl)}
    </div>
  );
}

Duration.propTypes = {
  /**
   * File to be summarized.
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default Duration;
