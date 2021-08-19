/**
 * Enum for file list types.
 * @enum {string}
 */
const FileListType = {
  grid: "grid",
  linear: "linear",

  values() {
    return [this.grid, this.linear];
  },
};

export default FileListType;
