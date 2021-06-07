import thumbnailURL from "../../../application/files/helpers/thumbnailURL";

/**
 * Get seek position in milliseconds.
 * @param file file in question.
 * @param position position in the video file (seconds or fraction).
 * @param units position type ("seconds" or "fraction")
 * @returns {number|*} position in milliseconds.
 */
function positionMillis(file, position, units = "fraction") {
  if (position == null) {
    return 0;
  } else if (units === "fraction") {
    return position * file.metadata.length;
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
export default function playerPreviewURL(file, position, units = "fraction") {
  if (position == null) {
    return file.preview;
  }
  return thumbnailURL(file.id, positionMillis(file, position, units));
}
