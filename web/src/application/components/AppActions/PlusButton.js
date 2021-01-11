import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SquaredIconButton from "../../../common/components/SquaredIconButton";
import AddOutlinedIcon from "@material-ui/icons/AddOutlined";
import { useIntl } from "react-intl";

const useStyles = makeStyles(() => ({
  button: {
    width: 35,
    height: 35,
    minWidth: "min-content",
    padding: 0,
  },
}));

function PlusButton(props) {
  const { onClick, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <SquaredIconButton
      onClick={onClick}
      color="primary"
      variant="contained"
      className={clsx(classes.button, className)}
      aria-label={intl.formatMessage({ id: "actions.addMedia" })}
      {...other}
    >
      <AddOutlinedIcon />
    </SquaredIconButton>
  );
}

PlusButton.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default PlusButton;
