import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import OutlinedCard from "../../basic/OutlinedCard";
import Title from "../../basic/Title";
import { useIntl } from "react-intl";
import ButtonBase from "@material-ui/core/ButtonBase";
import AddIcon from "@material-ui/icons/Add";
import { ButtonBaseProps } from "@material-ui/core/ButtonBase/ButtonBase";

const useStyles = makeStyles<Theme>((theme) => ({
  addRepoPlaceholder: {
    width: "100%",
    height: "100%",
    minHeight: 160,
    borderRadius: theme.spacing(1),
  },
  card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    borderStyle: "dashed",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    addRepo: intl.formatMessage({ id: "repos.addRepository" }),
  };
}

type AddRepositoryPlaceholderProps = ButtonBaseProps & {
  className?: string;
};

function AddRepoPlaceholder(props: AddRepositoryPlaceholderProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  return (
    <ButtonBase
      focusRipple
      className={clsx(classes.addRepoPlaceholder, className)}
      {...other}
    >
      <OutlinedCard className={classes.card} border="lean">
        <AddIcon />
        <Title text={messages.addRepo} variant="card" />
      </OutlinedCard>
    </ButtonBase>
  );
}

export default AddRepoPlaceholder;
