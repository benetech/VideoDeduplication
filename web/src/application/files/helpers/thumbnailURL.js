/**
 * Get file thumbnail URL.
 * @param fileId file id
 * @param positionMillis position in milli-seconds
 * @returns {string} thumbnail URL
 */
export default function thumbnailURL(fileId, positionMillis) {
  const seconds = Math.round(positionMillis / 1000);
  return `/api/v1/files/${fileId}/thumbnail?time=${seconds}`;
}
