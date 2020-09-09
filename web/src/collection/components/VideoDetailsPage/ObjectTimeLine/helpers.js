import ObjectKinds from "../ObjectKinds";
import { formatDuration } from "../../../../common/helpers/format";

/**
 * Get object kind
 */
export function objectKind(object) {
  return ObjectKinds[object.kind];
}

/**
 * Get string representation of object time position
 */
export function objectTime(object) {
  return formatDuration(object.position, null, false);
}
