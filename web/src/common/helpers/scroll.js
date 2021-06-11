/**
 * Scroll the referenced component into view.
 * @param ref
 * @param {Object} options
 */
export function scrollIntoView(ref, options = {}) {
  const { smooth = true } = options;
  if (ref == null || ref.current == null) {
    return;
  }
  ref.current.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "start",
  });
}
