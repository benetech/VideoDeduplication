import React from "react";
import { VideoFile } from "../../model/VideoFile";
import FileLinearList from "./FileLinearList";
import FileGridList from "./FileGridList";
import ListType from "../../model/ListType";
import FileGridListItem from "./FileGridList/FileGridListItem";
import FileGridListLoadTrigger from "./FileGridList/FileGridListLoadTrigger";
import FileLinearListItem from "./FileLinearList/FileLinearListItem";
import FileLinearListLoadTrigger from "./FileLinearList/FileLinearListLoadTrigger";

/**
 * Common file list component props.
 */
export type FileListProps = JSX.IntrinsicAttributes &
  React.RefAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
    className?: string;
  };

/**
 * Common file list item component props.
 */
export type FileListItemProps = {
  /**
   * File to be displayed
   */
  file: VideoFile;
  /**
   * File name substring that should be highlighted.
   */
  highlight?: string;
  /**
   * Handle item click action.
   */
  button?: boolean;
  /**
   * Handle item click.
   */
  onClick?: (file: VideoFile) => void;
  /**
   * Use dense layout.
   */
  dense?: boolean;
  /**
   * Control preview blur.
   * Has no effect at the moment.
   */
  blur?: boolean;
  /**
   * Number of items per row.
   */
  perRow?: number;
  className?: string;
};

/**
 * File list loading trigger component props.
 */
export type FileListLoadingTriggerProps = {
  /**
   * Indicate dense packing of file list items
   */
  dense?: boolean;
  /**
   * Indicate loading error
   */
  error?: boolean;
  /**
   * File loading is in progress
   */
  loading: boolean;
  /**
   * Trigger loading of the next portion of files
   */
  onLoad: () => Promise<any>;
  /**
   * Whether more files could be loaded
   */
  hasMore: boolean;
  /**
   * How many items will be displayed per row.
   */
  perRow?: number;
  className?: string;
};

/**
 * File list item component type.
 */
export type FileListItemComponent = React.ComponentType<FileListItemProps>;

/**
 * File list loading trigger component type.
 */
export type FileListLoadingTriggerComponent =
  React.ComponentType<FileListLoadingTriggerProps>;

/**
 * File list component type.
 */
export type FileListComponent = React.ComponentType<FileListProps>;

/**
 * File list view descriptor.
 */
export type FileListViewDescriptor = {
  readonly List: FileListComponent;
  readonly Item: FileListItemComponent;
  readonly LoadTrigger: FileListLoadingTriggerComponent;
};

/**
 * Grid file list descriptor.
 */
export const GridFileListDescr: FileListViewDescriptor = {
  List: FileGridList,
  Item: FileGridListItem,
  LoadTrigger: FileGridListLoadTrigger,
};

/**
 * Linear file list descriptor.
 */
export const LinearFileListDescr: FileListViewDescriptor = {
  List: FileLinearList,
  Item: FileLinearListItem,
  LoadTrigger: FileLinearListLoadTrigger,
};

/**
 * Resolve file list view.
 */
export function resolveFileListView(
  listType: ListType
): FileListViewDescriptor {
  switch (listType) {
    case ListType.linear:
      return LinearFileListDescr;
    case ListType.grid:
      return GridFileListDescr;
  }
}
