import { useDispatch, useSelector } from "react-redux";
import { selectFilesColl } from "../../state/root/selectors";
import { useCallback } from "react";
import {
  setCollBlur,
  setCollListType,
  setCollParams,
} from "../../state/files/coll/actions";

/**
 * Hook to access files collection API.
 * @return {{
 *   params: FileFilters,
 *   blur: boolean,
 *   listType: string,
 *   setParams: function,
 *   setBlur: function,
 *   setListType: function,
 * }}
 */
export default function useFilesColl() {
  const dispatch = useDispatch();
  const coll = useSelector(selectFilesColl);
  const setParams = useCallback((params) => dispatch(setCollParams(params)));
  const setBlur = useCallback((blur) => dispatch(setCollBlur(blur)));
  const setListType = useCallback((listType) =>
    dispatch(setCollListType(listType))
  );

  return {
    ...coll,
    setParams,
    setBlur,
    setListType,
  };
}
