/**
 * Get selector for the given component name.
 */
export default function selector(selector: string): string {
  return `[data-selector=${selector}]`;
}
