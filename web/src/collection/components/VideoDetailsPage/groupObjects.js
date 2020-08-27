/**
 * Group start position
 */
function startPosition(group) {
  return group[0].position;
}

/**
 * Split all objects into the close groups
 */
export function groupObjects(objects, minDist) {
  if (objects.length === 0) {
    return [];
  }

  // Sort objects by position in ascending order
  objects = [...objects];
  objects.sort((first, second) => first.position - second.position);

  // Group objects
  let currentGroup = [objects[0]];
  const groups = [currentGroup];

  for (let object of objects.slice(1)) {
    if (object.position - startPosition(currentGroup) < minDist) {
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
