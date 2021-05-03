import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

/**
 * Set the current value on switch cases.
 */
function bindProps(currentValue) {
  return (caseElement, currentIndex) => {
    if (!React.isValidElement(caseElement)) {
      return null;
    }

    // Get value identifying the current caseElement
    const match =
      caseElement.props.match === undefined
        ? currentIndex
        : caseElement.props.match;

    return React.cloneElement(caseElement, {
      ...caseElement.props,
      match,
      value: currentValue,
    });
  };
}

function SwitchComponent(props) {
  const { value, children, className, ...other } = props;

  // Set required child properties
  const cases = React.Children.map(children, bindProps(value));

  return (
    <React.Fragment className={clsx(className)} {...other}>
      {cases}
    </React.Fragment>
  );
}

SwitchComponent.propTypes = {
  /**
   * Current value that will be tested against cases.
   */
  value: PropTypes.any,
  /**
   * Cases list
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]),
  className: PropTypes.string,
};

export default SwitchComponent;
