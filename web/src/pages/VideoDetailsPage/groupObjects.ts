import objectPosition from "./objectPosition";
import { TemplateMatch } from "../../model/Template";

/**
 * Group start position
 */
function startPosition(group: TemplateMatch[]): number {
  return objectPosition(group[0]);
}

/**
 * Split all objects into the close groups
 */
export function groupObjects(
  objects: TemplateMatch[],
  minDist: number
): TemplateMatch[][] {
  if (objects.length === 0) {
    return [];
  }

  // Sort objects by position in ascending order
  objects = [...objects];
  objects.sort(
    (first, second) => objectPosition(first) - objectPosition(second)
  );

  // Group objects
  let currentGroup: TemplateMatch[] = [objects[0]];
  const groups: TemplateMatch[][] = [currentGroup];

  for (const object of objects.slice(1)) {
    if (objectPosition(object) - startPosition(currentGroup) < minDist) {
      // if distance is small enough, add the object to the current group
      currentGroup.push(object);
    } else {
      // otherwise create a new group and add it to the result collection
      currentGroup = [object];
      groups.push(currentGroup);
    }
  }

  return groups;
}
