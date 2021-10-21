import { MixinsOptions } from "@material-ui/core/styles/createMixins";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

// Material-UI interface augmentation for custom style properties.
declare module "@material-ui/core/styles/createMixins" {
  interface Mixins {
    drawer: CSSProperties;
    title0: CSSProperties;
    title1: CSSProperties;
    title2: CSSProperties;
    title3: CSSProperties;
    title4: CSSProperties;
    title5: CSSProperties;
    textEllipsisStart: CSSProperties;
    textEllipsis: CSSProperties;
    captionText: CSSProperties;
    valueNormal: CSSProperties;
    valueHighlighted: CSSProperties;
    valueNormalSmall: CSSProperties;
    navlink: CSSProperties;
    navlinkSmall: CSSProperties;
    navlinkLarge: CSSProperties;
    text: CSSProperties;
    textSmall: CSSProperties;
    descriptionText: CSSProperties;
    panel: CSSProperties;
    noselect: CSSProperties;
    logs: CSSProperties;
  }
}

/**
 * Reusable style mixins (presets).
 */
const mixins: MixinsOptions = {
  drawer: { width: 261 },
  title0: {
    height: 62,
    color: "#040303",
    fontFamily: "Roboto",
    fontSize: 53,
    fontWeight: "bold",
    letterSpacing: 0,
    lineHeight: "62px",
  },
  title1: {
    fontFamily: "Roboto",
    fontSize: 43,
    letterSpacing: 0,
  },
  title2: {
    fontFamily: "Roboto",
    fontSize: 30,
    letterSpacing: 0,
    lineHeight: "35px",
  },
  title3: {
    fontFamily: "Roboto",
    fontSize: 20,
    letterSpacing: 0,
  },
  title4: {
    fontFamily: "Roboto",
    fontSize: 17,
    letterSpacing: 0.12,
    lineHeight: "20px",
  },
  title5: {
    fontFamily: "Roboto",
    fontSize: 14,
    letterSpacing: 0.1,
    lineHeight: "16px",
    fontWeight: 500,
  },
  textEllipsisStart: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    direction: "rtl",
    textAlign: "left",
  },
  textEllipsis: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  captionText: {
    color: "#8A96A0",
    fontFamily: "Lato",
    fontSize: 12,
    letterSpacing: 0.08,
    lineHeight: "13px",
  },
  valueNormal: {
    fontFamily: "Lato",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.1,
    lineHeight: "20px",
  },
  valueHighlighted: {
    fontFamily: "Lato",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.11,
    lineHeight: "20px",
  },
  valueNormalSmall: {
    fontFamily: "Lato",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.08,
    lineHeight: "15px",
  },
  navlink: {
    fontFamily: "Roboto",
    fontSize: 17,
    letterSpacing: 0,
    lineHeight: "20px",
  },
  navlinkSmall: {
    fontFamily: "Roboto",
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: "16px",
  },
  navlinkLarge: {
    fontFamily: "Roboto",
    fontSize: 20,
    letterSpacing: 0.14,
    lineHeight: "24px",
  },
  text: {
    fontFamily: "Roboto",
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: "18px",
  },
  textSmall: {
    fontFamily: "Roboto",
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: "14px",
  },
  descriptionText: {
    fontFamily: "Roboto",
    fontSize: 18,
    letterSpacing: 0,
    lineHeight: "21px",
  },
  panel: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
  },
  /**
   * Disable text selection
   */
  noselect: {
    // iOS Safari
    "-webkit-touch-callout": "none",
    // Safari
    "-webkit-user-select": "none",
    // Konqueror HTML
    "-khtml-user-select": "none",
    // Old versions of Firefox
    "-moz-user-select": "none",
    // Internet Explorer/Edge
    "-ms-user-select": "none",
    // Non-prefixed version, currently
    // supported by Chrome, Edge, Opera and Firefox
    "user-select": "none",
  },
  logs: {
    backgroundColor: "#272c34",
    color: "#ffffff",
  },
};

export default mixins;
