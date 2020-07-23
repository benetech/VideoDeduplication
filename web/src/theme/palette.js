import { colors } from "@material-ui/core";

const white = "#FFFFFF";

const palette = {
  white,
  divider: "#979797",
  success: {
    contrastText: white,
    dark: colors.green[900],
    main: colors.green[600],
    light: colors.green[400],
  },
  warning: {
    contrastText: white,
    dark: colors.orange[900],
    main: colors.orange[600],
    light: colors.orange[400],
  },
  primary: {
    contrastText: white,
    main: "#F75537",
    dark: "#F75537",
    light: "#FF846D",
  },
  action: {
    textInactive: "#808080",
  },
};

export default palette;