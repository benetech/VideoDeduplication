import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import StandardIcon from "../StandardIcon";
import ButtonBase from "@material-ui/core/ButtonBase";
import { Paper } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(0, 0, 0, 0)",
  },
  icon: {
    fontSize: 40,
    width: 40,
    height: 40,
  },
  selected: {
    borderColor: theme.palette.primary.main,
  },
}));

const IconOption = React.memo(function IconOption(props) {
  const { name, onClick, selected, className, ...other } = props;
  const classes = useStyles();
  const handleClick = useCallback(() => onClick(name), [name, onClick]);

  return (
    <ButtonBase
      focusRipple
      className={clsx(className)}
      onClick={handleClick}
      {...other}
      color="primary"
      component="div"
    >
      <Paper className={clsx(classes.paper, selected && classes.selected)}>
        <StandardIcon name={name} className={classes.icon} />
      </Paper>
    </ButtonBase>
  );
});

IconOption.propTypes = {
  /**
   * Icon name.
   */
  name: PropTypes.string.isRequired,
  /**
   * Click handler.
   */
  onClick: PropTypes.func.isRequired,
  /**
   * True iff icon option is selected.
   */
  selected: PropTypes.bool,
  className: PropTypes.string,
};

export default IconOption;
