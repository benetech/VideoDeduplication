import getEntityId from "../../../../lib/entity/getEntityId";
import { VideoFile } from "../../../../model/VideoFile";

/**
 * Get file thumbnail URL.
 * @param file
 * @param positionMillis position in milli-seconds
 * @returns thumbnail URL
 */
export default function thumbnailURL(
  file: VideoFile | VideoFile["id"],
  positionMillis: number
): string {
  const seconds = Math.round(positionMillis);
  return `/api/v1/files/${getEntityId(file)}/thumbnail?time=${seconds}`;
}
