import { routes } from "../../../routing/routes";

/**
 * Get comparison page url for the given link.
 *
 * @param origin id of the mother file.
 * @param link graph link between two related files.
 */
export default function comparisonURL(origin, link) {
  const [source, target] =
    link.source === origin
      ? [link.source, link.target]
      : [link.target, link.source];
  return routes.collection.fileComparisonURL(source, target);
}
