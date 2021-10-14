import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) => ({
  "@global": {
    "*::-webkit-scrollbar": {
      height: theme.dimensions.scrollbar.size,
      width: theme.dimensions.scrollbar.size,
      backgroundColor: theme.palette.background.default,
    },
    "*::-webkit-scrollbar-track": {
      "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,0.00)",
    },
    "*::-webkit-scrollbar-thumb": {
      outline: "1px solid slategrey",
      backgroundColor: theme.palette.grey[400],
      borderRadius: theme.dimensions.scrollbar.size,
      border: `${theme.dimensions.scrollbar.size / 4}px solid ${
        theme.palette.background.default
      }`,
    },
  },
}));

/**
 * Apply custom scroll-bar styles to all children.
 */
const CustomScrollbar = (props: CustomScrollbarProps): JSX.Element => {
  const { children } = props;

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const classes = useStyles();

  /* eslint-enable @typescript-eslint/no-unused-vars */
  return <React.Fragment>{children}</React.Fragment>;
};

type CustomScrollbarProps = {
  children?: React.ReactNode;
};
export default CustomScrollbar;
