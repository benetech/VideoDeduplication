import React from "react";
import PropTypes from "prop-types";
import { FileType } from "../../../../prop-types/FileType";
import RemoteFileLinearListItem from "./RemoteFileLinearListItem";
import LocalFileLinearListItem from "./LocalFileLinearListItem";

const FileLinearListItem = React.memo(function FpLinearListItem(props) {
  const { file, ...other } = props;
  delete other["blur"];

  const ListItem = file?.external
    ? RemoteFileLinearListItem
    : LocalFileLinearListItem;

  return <ListItem file={file} {...other} />;
});

FileLinearListItem.propTypes = {
  /**
   * File to be displayed
   */
  file: FileType.isRequired,
  /**
   * File name substring that should be highlighted.
   */
  highlight: PropTypes.string,
  /**
   * Handle item click action.
   */
  button: PropTypes.bool,
  /**
   * Handle item click.
   */
  onClick: PropTypes.func,
  /**
   * Use dense layout.
   */
  dense: PropTypes.bool,
  /**
   * Control preview blur.
   * Has no effect at the moment.
   */
  blur: PropTypes.bool,
  className: PropTypes.string,
};

export default FileLinearListItem;
