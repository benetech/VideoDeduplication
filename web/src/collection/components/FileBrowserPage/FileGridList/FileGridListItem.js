import React from "react";
import PropTypes from "prop-types";
import { FileType } from "../../../../prop-types/FileType";
import RemoteFileGridListItem from "./RemoteFileGridListItem";
import LocalFileGridListItem from "./LocalFileGridListItem";

/**
 * Generic file grid list item.
 *
 * Chooses the file type specific component to display file.
 */
const FileGridListItem = React.memo(function FpGridListItem(props) {
  const { file, ...other } = props;

  // Choose appropriate component to display file
  const ItemComponent = file?.external
    ? RemoteFileGridListItem
    : LocalFileGridListItem;

  return <ItemComponent file={file} {...other} />;
});

FileGridListItem.propTypes = {
  /**
   * File which will be displayed.
   */
  file: FileType.isRequired,
  /**
   * Use cursor pointer style.
   */
  button: PropTypes.bool,
  /**
   * Use more compact layout.
   */
  dense: PropTypes.bool,
  /**
   * Highlight name substring.
   */
  highlight: PropTypes.string,
  /**
   * Handle item click.
   */
  onClick: PropTypes.func,
  /**
   * Control preview blur.
   */
  blur: PropTypes.bool,
  className: PropTypes.string,
};

export default FileGridListItem;
