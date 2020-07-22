import { createMuiTheme } from "@material-ui/core";

import palette from "./palette";
import mixins from "./mixins";
import dimensions from "./dimensions";

/**
 * Default theme.
 *
 * @see https://material-ui.com/customization/theming
 */
const theme = createMuiTheme({
  palette,
  mixins,
  dimensions,
});

export default theme;
