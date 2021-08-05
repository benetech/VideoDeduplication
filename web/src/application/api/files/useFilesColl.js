import { useDispatch, useSelector } from "react-redux";
import { selectFilesColl } from "../../state/root/selectors";
import { useCallback } from "react";
import {
  setCollBlur,
  setCollListType,
  setCollParams,
  updateCollParams,
} from "../../state/files/coll/actions";

/**
 * Hook to access files collection API.
 * @return {{
 *   params: FileFilters,
 *   blur: boolean,
 *   listType: string,
 *   setParams: function,
 *   updateParams: function,
 *   setBlur: function,
 *   setListType: function,
 * }}
 */
export default function useFilesColl() {
  const dispatch = useDispatch();
  const coll = useSelector(selectFilesColl);
  const setBlur = useCallback((blur) => dispatch(setCollBlur(blur)));
  const setParams = useCallback((params) => dispatch(setCollParams(params)));
  const updateParams = useCallback((params) =>
    dispatch(updateCollParams(params))
  );
  const setListType = useCallback((listType) =>
    dispatch(setCollListType(listType))
  );

  return {
    ...coll,
    setParams,
    updateParams,
    setBlur,
    setListType,
  };
}
