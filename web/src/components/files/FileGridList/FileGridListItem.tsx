import React from "react";
import RemoteFileGridListItem from "./RemoteFileGridListItem";
import LocalFileGridListItem from "./LocalFileGridListItem";
import { FileListItemProps } from "../FileList";

/**
 * Generic file grid list item.
 *
 * Chooses the file type specific component to display file.
 */

const FileGridListItem = React.memo(function FpGridListItem(
  props: FileListItemProps
) {
  const { file, ...other } = props; // Choose appropriate component to display file

  const ItemComponent = file?.external
    ? RemoteFileGridListItem
    : LocalFileGridListItem;
  return <ItemComponent file={file} {...other} />;
});

export default FileGridListItem;
