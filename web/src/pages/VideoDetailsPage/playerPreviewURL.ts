import thumbnailURL from "../../application/api/files/helpers/thumbnailURL";
import { TimeUnits } from "../../components/files/VideoPlayer/VideoPlayerAPI";
import { VideoFile } from "../../model/VideoFile";

/**
 * Get seek position in milliseconds.
 * @param file file in question.
 * @param position position in the video file (seconds or fraction).
 * @param units position type ("seconds" or "fraction")
 * @returns {number|*} position in milliseconds.
 */
function positionMillis(
  file: VideoFile,
  position: number | undefined,
  units: TimeUnits = "fraction"
): number {
  if (position == null) {
    return 0;
  } else if (units === "fraction") {
    return position * (file.metadata?.length || 0);
  } else if (units === "seconds") {
    return position * 1000;
  } else {
    console.warn("Unknown position units", { position, units });
    return 0;
  }
}

/**
 * Get player preview URL based on file, seek position and seek units.
 */
export default function playerPreviewURL(
  file: VideoFile,
  position: number | undefined,
  units: TimeUnits = "fraction"
): string {
  if (position == null) {
    return file.preview;
  }
  return thumbnailURL(file.id, positionMillis(file, position, units));
}
