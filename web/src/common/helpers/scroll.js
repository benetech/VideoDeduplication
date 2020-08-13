/**
 * Scroll the referenced component into view.
 * @param ref
 */
export function scrollIntoView(ref) {
  if (ref == null || ref.current == null) {
    return;
  }
  ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
}
