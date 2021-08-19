/**
 * Get comparison file ids from the graph link.
 *
 * @param origin id of the mother file.
 * @param {{source, target}} link graph link between two related files.
 */
export default function linkComparison(origin, link) {
  const [source, target] =
    link.source === origin
      ? [link.source, link.target]
      : [link.target, link.source];
  return [source, target];
}
