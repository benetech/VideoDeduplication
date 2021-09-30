import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import AddIcon from "@material-ui/icons/Add";
import Hidden from "@material-ui/core/Hidden";
import SquaredIconButton from "../../../components/basic/SquaredIconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "../../../components/basic/Button";
import { ButtonProps } from "@material-ui/core/Button/Button";

const useStyles = makeStyles<Theme>(() => ({
  buttonIcon: {
    marginRight: 12,
  },
}));

function AddMediaButton(props: ButtonProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <React.Fragment>
      <Hidden smDown>
        <Button className={className} {...other}>
          <AddIcon className={classes.buttonIcon} />
          {intl.formatMessage({
            id: "actions.addMedia",
          })}
        </Button>
      </Hidden>
      <Hidden mdUp>
        <Tooltip
          title={intl.formatMessage({
            id: "actions.addMedia",
          })}
        >
          <SquaredIconButton className={className} {...other}>
            <AddIcon />
          </SquaredIconButton>
        </Tooltip>
      </Hidden>
    </React.Fragment>
  );
}

export default AddMediaButton;
