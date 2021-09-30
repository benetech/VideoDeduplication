import { VideoFile } from "../../../../model/VideoFile";
import { ClusterLink, ClusterNode } from "../model";
import getEntityId from "../../../../lib/entity/getEntityId";

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
  if (getEntityId(link.source) === origin) {
    return [
      getEntityId<ClusterNode>(link.source),
      getEntityId<ClusterNode>(link.target),
    ];
  } else {
    return [
      getEntityId<ClusterNode>(link.target),
      getEntityId<ClusterNode>(link.source),
    ];
  }
}
