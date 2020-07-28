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
