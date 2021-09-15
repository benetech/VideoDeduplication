/**
 * Named executable action (e.g. in context menu).
 */
type Action = {
  title: string;
  handler: () => void;
};

export default Action;
