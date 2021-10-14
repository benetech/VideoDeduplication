import React from "react";
import RemoteFileLinearListItem from "./RemoteFileLinearListItem";
import LocalFileLinearListItem from "./LocalFileLinearListItem";
import { FileListItemProps } from "../FileList";

const FileLinearListItem = React.memo(function FpLinearListItem(
  props: FileListItemProps
) {
  const { file, ...other } = props;
  delete other["blur"];
  const ListItem = file?.external
    ? RemoteFileLinearListItem
    : LocalFileLinearListItem;
  return <ListItem file={file} {...other} />;
});

export default FileLinearListItem;
