import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import Hidden from "@material-ui/core/Hidden";
import SquaredIconButton from "../../../../common/components/SquaredIconButton";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme) => ({
  buttonIcon: {
    marginRight: 12,
  },
  button: {
    textTransform: "none",
    boxShadow: "none",
  },
}));

function AddMediaButton(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <React.Fragment>
      <Hidden smDown>
        <Button className={clsx(classes.button, className)} {...other}>
          <AddIcon className={classes.buttonIcon} />
          {intl.formatMessage({ id: "actions.addMedia" })}
        </Button>
      </Hidden>
      <Hidden mdUp>
        <Tooltip title={intl.formatMessage({ id: "actions.addMedia" })}>
          <SquaredIconButton
            className={clsx(classes.button, className)}
            {...other}
          >
            <AddIcon />
          </SquaredIconButton>
        </Tooltip>
      </Hidden>
    </React.Fragment>
  );
}

AddMediaButton.propTypes = {
  className: PropTypes.string,
};

export default AddMediaButton;
