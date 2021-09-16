import getEntityId from "../../../../lib/entity/getEntityId";

/**
 * Get file thumbnail URL.
 * @param {FileEntity|number|string} file file id
 * @param {number} positionMillis position in milli-seconds
 * @returns {string} thumbnail URL
 */
export default function thumbnailURL(file, positionMillis) {
  const seconds = Math.round(positionMillis);
  return `/api/v1/files/${getEntityId(file)}/thumbnail?time=${seconds}`;
}
