import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import { formatBool } from "../../../common/helpers/format";

const useStyles = makeStyles((theme) => ({
  bool: {
    ...theme.mixins.valueNormal,
    color: theme.palette.primary.main,
  },
}));

function Bool(props) {
  const { value, className } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <div className={clsx(classes.bool, className)}>
      {formatBool(value, intl)}
    </div>
  );
}

Bool.propTypes = {
  /**
   * Boolean value to be displayed
   */
  value: PropTypes.bool,
  className: PropTypes.string,
};

export default Bool;
