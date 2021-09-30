import React from "react";

/**
 * Default expected component attributes.
 */
export interface DefaultExpectedProps
  extends JSX.IntrinsicAttributes,
    React.HTMLProps<HTMLElement> {}

/**
 * Component type with default expected props.
 */
export type ComponentType = React.ComponentType<DefaultExpectedProps>;
