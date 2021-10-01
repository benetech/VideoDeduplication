import React from "react";

/**
 * Set the current value on switch cases.
 */
function bindProps<T>(
  currentValue: T
): (element: React.ReactNode, index: number) => React.ReactNode | null {
  return (caseElement, currentIndex) => {
    if (!React.isValidElement(caseElement)) {
      return null;
    } // Get value identifying the current caseElement

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

function SwitchComponent<T = any>(props: SwitchComponentProps<T>): JSX.Element {
  const { value, children } = props; // Set required child properties

  const cases = React.Children.map(children, bindProps(value));
  return <React.Fragment>{cases}</React.Fragment>;
}

type SwitchComponentProps<T> = {
  /**
   * Current value that will be tested against cases.
   */
  value?: T;

  /**
   * Cases list
   */
  children?: React.ReactNode;
};
export default SwitchComponent;
