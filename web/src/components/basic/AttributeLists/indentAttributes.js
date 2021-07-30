import Divider from "./Divider";
import Spacer from "./Spacer";
import React from "react";

/**
 * Add indentation between attribute elements.
 * @param attributes attribute elements array.
 * @param divider display visible dividers
 * @param spacerClass css class of the spacer element
 * @param dividerClass css class of the divider element
 */
export default function indentAttributes(
  attributes,
  divider,
  { spacerClass, dividerClass } = {}
) {
  const result = [];
  const indentClass = divider ? dividerClass : spacerClass;
  const IndentComponent = divider ? Divider : Spacer;
  if (attributes != null) {
    attributes.forEach((attribute, index) => {
      result.push(attribute);
      if (index < attributes.length - 1) {
        result.push(
          <IndentComponent key={`divider-${index}`} className={indentClass} />
        );
      }
    });
  }
  return result;
}
