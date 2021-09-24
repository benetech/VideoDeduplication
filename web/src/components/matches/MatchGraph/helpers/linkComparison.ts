import { VideoFile } from "../../../../model/VideoFile";
import { ClusterLink } from "../model";

/**
 * Get comparison file ids from the graph link.
 *
 * @param origin id of the mother file.
 * @param link graph link between two related files.
 */
export default function linkComparison(
  origin: VideoFile["id"],
  link: ClusterLink
): [number, number] {
  const [source, target] =
    link.source === origin
      ? [link.source, link.target]
      : [link.target, link.source];
  return [source, target];
}
