/**
 * Reusable style mixins (presets).
 */
const mixins = {
  drawer: { width: 261 },
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
};

export default mixins;
