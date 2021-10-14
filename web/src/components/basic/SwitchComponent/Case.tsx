import React from "react";

function Case(props: CaseProps): JSX.Element | null {
  const { value, match, children } = props;

  if (value === match) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return null;
}

type CaseProps = {
  /**
   * Current value that will be tested against match-value.
   */
  value?: any;

  /**
   * Expected value that triggers the display of the case contents.
   */
  match?: any;

  /**
   * Case content to be displayed.
   */
  children?: React.ReactNode;
};
export default Case;
