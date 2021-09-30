import { formatDuration } from "../../../../lib/helpers/format";
import objectPosition from "../../objectPosition";
import { TemplateMatch } from "../../../../model/Template";
import { IntlShape } from "react-intl";

/**
 * Get string representation of object time position
 */
export function objectTime(object: TemplateMatch, intl: IntlShape): string {
  return formatDuration(objectPosition(object), intl, false);
}
