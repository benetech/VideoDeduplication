/**
 * Get query progress
 * @param {number|undefined|null} total
 * @param {*[]} items
 * @return {number}
 */
export default function queryProgress(total, items) {
  if (total == null) {
    return 0;
  }
  if (total <= items.length) {
    return 1;
  }
  return items.length / total;
}
