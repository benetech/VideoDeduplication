import { useDispatch, useSelector } from "react-redux";
import { selectFilesColl } from "../../state/root/selectors";
import { useCallback } from "react";
import {
  setCollBlur,
  setCollListType,
  setCollParams,
  updateCollParams,
} from "../../state/files/coll/actions";
import { DefaultFilters } from "../../state/files/coll/initialState";

/**
 * Hook to access files main collection API.
 *
 * The main collection is a list of files displayed on the "Collection" root page.
 *
 * @return {{
 *   params: FileFilters,
 *   blur: boolean,
 *   listType: string,
 *   setParams: function,
 *   updateParams: function,
 *   setBlur: function,
 *   setListType: function,
 *   restoreDefaults: function
 * }}
 */
export default function useFilesColl() {
  const dispatch = useDispatch();
  const coll = useSelector(selectFilesColl);
  const setBlur = useCallback((blur) => dispatch(setCollBlur(blur)));
  const setParams = useCallback((params) => dispatch(setCollParams(params)));
  const restoreDefaults = useCallback(() =>
    dispatch(setCollParams(DefaultFilters))
  );
  const updateParams = useCallback((params) =>
    dispatch(updateCollParams(params))
  );
  const setListType = useCallback((listType) =>
    dispatch(setCollListType(listType))
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
