import React from "react";

type ScrollOptions = {
  smooth?: boolean;
};

/**
 * Scroll the referenced component into view.
 */
export function scrollIntoView(
  ref: React.MutableRefObject<any>,
  options: ScrollOptions = {}
): void {
  const { smooth = true } = options;
  if (ref == null || ref.current == null) {
    return;
  }
  ref.current.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "start",
  });
}
