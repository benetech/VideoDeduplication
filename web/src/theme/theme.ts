import { createTheme, Theme } from "@material-ui/core";
import palette from "./palette";
import mixins from "./mixins";
import dimensions, { DimensionOptions, Dimensions } from "./dimensions";

declare module "@material-ui/core" {
  interface Theme {
    dimensions: Dimensions;
  }

  interface ThemeOptions {
    dimensions: DimensionOptions;
  }
}

/**
 * Default theme.
 *
 * @see https://material-ui.com/customization/theming
 */
const theme: Theme = createTheme({
  palette,
  mixins,
  dimensions,
  breakpoints: {
    values: {
      xs: 0,
      sm: 845,
      md: 1120,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;
