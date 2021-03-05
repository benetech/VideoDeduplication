import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import FileType from "../../../prop-types/FileType";

const useStyles = makeStyles((theme) => ({
  attrName: {
    ...theme.mixins.valueNormal,
    color: theme.palette.action.textInactive,
  },
  attrValue: {
    ...theme.mixins.valueNormal,
    color: theme.palette.primary.main,
  },
}));

function Partner(props) {
  const { file, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <div className={className} {...other}>
      <span className={classes.attrName}>
        {intl.formatMessage({ id: "file.owner" })}
        {": "}
      </span>
      <span className={classes.attrValue}>{file?.contributor?.name}</span>
    </div>
  );
}

Partner.propTypes = {
  /**
   * File to be summarized.
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default Partner;
