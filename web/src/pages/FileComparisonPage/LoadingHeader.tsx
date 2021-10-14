import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Loading from "../../components/basic/Loading";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    minHeight: theme.spacing(12),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

function LoadingHeader(props: LoadingHeaderProps): JSX.Element {
  const { error, errorMessage, onRetry, progress, className, ...other } = props;
  const classes = useStyles();
  return (
    <Paper className={clsx(classes.root, className)} {...other}>
      <Loading
        error={error}
        errorMessage={errorMessage}
        onRetry={onRetry}
        progress={progress}
      />
    </Paper>
  );
}

type LoadingHeaderProps = {
  /**
   * Indicate loading error
   */
  error?: boolean;

  /**
   * The value of the progress indicator for the determinate and static variants.
   * Value between 0 and 1.
   */
  progress?: number;

  /**
   * Trigger loading of the next portion of files
   */
  onRetry: () => void;

  /**
   * Message displayed when error=true
   */
  errorMessage: string;
  className?: string;
};
export default LoadingHeader;
