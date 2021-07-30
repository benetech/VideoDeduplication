import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import AddIcon from "@material-ui/icons/Add";
import Hidden from "@material-ui/core/Hidden";
import SquaredIconButton from "../../../components/basic/SquaredIconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "../../../components/basic/Button";

const useStyles = makeStyles(() => ({
  buttonIcon: {
    marginRight: 12,
  },
}));

function AddMediaButton(props) {
  const { className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <React.Fragment>
      <Hidden smDown>
        <Button className={className} {...other}>
          <AddIcon className={classes.buttonIcon} />
          {intl.formatMessage({ id: "actions.addMedia" })}
        </Button>
      </Hidden>
      <Hidden mdUp>
        <Tooltip title={intl.formatMessage({ id: "actions.addMedia" })}>
          <SquaredIconButton className={className} {...other}>
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
