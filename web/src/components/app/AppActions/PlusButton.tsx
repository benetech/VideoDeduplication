import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import SquaredIconButton from "../../basic/SquaredIconButton";
import AddOutlinedIcon from "@material-ui/icons/AddOutlined";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>(() => ({
  button: {
    width: 35,
    height: 35,
    minWidth: "min-content",
    padding: 0,
  },
}));

function PlusButton(props: PlusButtonProps): JSX.Element {
  const { onClick, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <SquaredIconButton
      onClick={onClick}
      color="primary"
      variant="contained"
      className={clsx(classes.button, className)}
      aria-label={intl.formatMessage({
        id: "actions.addMedia",
      })}
      {...other}
    >
      <AddOutlinedIcon />
    </SquaredIconButton>
  );
}

type PlusButtonProps = {
  onClick?: (...args: any[]) => void;
  className?: string;
};
export default PlusButton;
