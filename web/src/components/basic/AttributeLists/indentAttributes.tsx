import React from "react";
import Divider from "./Divider";
import Spacer from "./Spacer";

type IndentAttributesOptions = {
  spacerClass?: string;
  dividerClass?: string;
};

/**
 * Add indentation between attribute elements.
 * @param attributes attribute elements array.
 * @param divider display visible dividers
 * @param options
 */
export default function indentAttributes(
  attributes: React.ReactNode[] | undefined | null,
  divider: boolean,
  options: IndentAttributesOptions = {}
): React.ReactNode[] {
  const { spacerClass, dividerClass } = options;
  const result: React.ReactNode[] = [];
  if (attributes == null) {
    return result;
  }

  const indentClass = divider ? dividerClass : spacerClass;
  const IndentComponent = divider ? Divider : Spacer;
  attributes.forEach((attribute, index) => {
    result.push(attribute);
    if (index < attributes.length - 1) {
      result.push(
        <IndentComponent key={`divider-${index}`} className={indentClass} />
      );
    }
  });
  return result;
}
