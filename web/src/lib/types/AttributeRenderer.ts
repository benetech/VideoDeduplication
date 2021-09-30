import React from "react";
import { IntlShape } from "react-intl";

/**
 * Single attribute value renderer.
 */
export type AttributeRenderer<TData> = {
  title: string;
  value: (data: TData, intl: IntlShape) => React.ReactNode;
};
