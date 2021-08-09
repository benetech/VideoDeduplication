import { formatDuration } from "../../../lib/helpers/format";
import position from "../objectPosition";

/**
 * Get string representation of object time position
 */
export function objectTime(object) {
  return formatDuration(position(object), null, false);
}
