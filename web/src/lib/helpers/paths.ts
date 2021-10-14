/**
 * Get file name from path.
 */
export function basename(filename: string): string {
  return filename.substring(filename.lastIndexOf("/") + 1);
}
