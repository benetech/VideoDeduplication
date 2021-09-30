import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Paper, Theme } from "@material-ui/core";
import StandardIcon from "../StandardIcon";
import ButtonBase from "@material-ui/core/ButtonBase";

const useStyles = makeStyles<Theme>((theme) => ({
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

const IconOption = React.memo(function IconOption(
  props: IconOptionProps
): JSX.Element {
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

type IconOptionProps = {
  /**
   * Icon name.
   */
  name: string;

  /**
   * Click handler.
   */
  onClick: (name: string) => void;

  /**
   * True iff icon option is selected.
   */
  selected?: boolean;
  className?: string;
};

export default IconOption;
