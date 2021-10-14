import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import PersonOutlinedIcon from "@material-ui/icons/PersonOutlined";
import ButtonBase from "@material-ui/core/ButtonBase";
import { useIntl } from "react-intl";

const useStyles = makeStyles<Theme>((theme) => ({
  button: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    minHeight: 48,
    borderRadius: 24,
    paddingRight: theme.spacing(0.5),
  },
  profileIcon: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
}));

function ProfileMenuButton(props: ProfileMenuButtonProps): JSX.Element {
  const { className } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <ButtonBase
      className={clsx(classes.button, className)}
      focusRipple
      disableTouchRipple
      aria-label={intl.formatMessage({
        id: "actions.showProfileMenu",
      })}
    >
      <PersonOutlinedIcon className={classes.profileIcon} />
      <ArrowDropDownIcon />
    </ButtonBase>
  );
}

type ProfileMenuButtonProps = {
  className?: string;
};
export default ProfileMenuButton;
