import { colors } from "@material-ui/core";
import {
  Palette,
  PaletteOptions,
} from "@material-ui/core/styles/createPalette";

// Material-UI interface augmentation for custom style properties.
declare module "@material-ui/core/styles/createPalette" {
  interface TypeAction {
    textInactive: string;
  }

  interface TypeBackground {
    backdrop: string;
  }

  interface Palette {
    white: string;
    dividerLight: string;
    backgroundInactive: string;
    border: {
      light: string;
    };
  }

  interface PaletteOptions {
    white?: string;
    dividerLight?: string;
    backgroundInactive?: string;
    border?: {
      light?: string;
    };
  }
}

const white = "#FFFFFF";

const palette: PaletteOptions = {
  white,
  divider: "#979797",
  dividerLight: "#D8D8D8",
  backgroundInactive: "#D8D8D8",
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
  secondary: {
    contrastText: white,
    main: "#677083",
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
  border: {
    light: "#EDEDED",
  },
  background: {
    backdrop: "rgba(249, 251, 251, 0.8)",
  },
};

export type JusticeAIPalette = Palette & typeof palette;

export default palette;
