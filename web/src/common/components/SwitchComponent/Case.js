import React from "react";
import PropTypes from "prop-types";

function Case(props) {
  const { value, match, children } = props;
  if (value === match) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  return null;
}

Case.propTypes = {
  /**
   * Current value that will be tested against match-value.
   */
  value: PropTypes.any,
  /**
   * Expected value that triggers the display of the case contents.
   */
  match: PropTypes.any,
  /**
   * Case content to be displayed.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Case;
