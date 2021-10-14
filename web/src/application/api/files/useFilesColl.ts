import { useDispatch, useSelector } from "react-redux";
import { selectFilesColl } from "../../state/root/selectors";
import { useCallback } from "react";
import {
  setCollBlur,
  setCollListType,
  setCollParams,
  updateCollParams,
} from "../../state/files/coll/actions";
import { DefaultFilters, FileFilters } from "../../../model/VideoFile";
import ListType from "../../../model/ListType";
import { CollState } from "../../state/files/coll/initialState";

/**
 * File collection API.
 */
export type FileCollectionAPI = {
  params: FileFilters;
  blur: boolean;
  listType: ListType;
  setParams: (params: FileFilters) => void;
  updateParams: (params: Partial<FileFilters>) => void;
  setBlur: (blur: boolean) => void;
  setListType: (listType: ListType) => void;
  restoreDefaults: () => void;
};

/**
 * Hook to access files main collection API.
 *
 * The main collection is a list of files displayed on the "Collection" root page.
 */
export default function useFilesColl(): FileCollectionAPI {
  const dispatch = useDispatch();
  const coll: CollState = useSelector(selectFilesColl);
  const setBlur = useCallback(
    (blur: boolean) => dispatch(setCollBlur(blur)),
    []
  );
  const setParams = useCallback(
    (params: FileFilters) => dispatch(setCollParams(params)),
    []
  );
  const restoreDefaults = useCallback(
    () => dispatch(setCollParams(DefaultFilters)),
    []
  );
  const updateParams = useCallback(
    (params: Partial<FileFilters>) => dispatch(updateCollParams(params)),
    []
  );
  const setListType = useCallback(
    (listType: ListType) => dispatch(setCollListType(listType)),
    []
  );

  return {
    params: coll.params,
    blur: coll.blur,
    listType: coll.listType,
    setParams,
    updateParams,
    setBlur,
    setListType,
    restoreDefaults,
  };
}
