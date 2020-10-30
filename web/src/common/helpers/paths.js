/**
 * Get file name from path.
 */
export function basename(filename) {
  return filename.substring(filename.lastIndexOf("/") + 1);
}
