import { TemplateMatch } from "../../model/Template";

/**
 * Get object position.
 */
export default function objectPosition(object: TemplateMatch): number {
  return object.start;
}
