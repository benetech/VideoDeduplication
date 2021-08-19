import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useServer } from "../../../server-api/context";
import { updateObject } from "../../state/objects/common/actions";
import handleError from "../../../lib/helpers/handleError";

/**
 * Get callback to update objects (template-matches).
 * @param {boolean} raise if false, the callback will not throw exceptions
 * @return {(function(ObjectEntity, ObjectEntity): Promise<ObjectEntity>)}
 */
export default function useUpdateObject(raise = true) {
  const server = useServer();
  const dispatch = useDispatch();

  return useCallback(async (updated, original) => {
    if (updated.id !== original?.id) {
      return handleError(
        raise,
        new Error(`Cannot update object id: ${updated.id} != ${original?.id}`)
      );
    }
    try {
      dispatch(updateObject(updated));
      return await server.templateMatches.update(updated);
    } catch (error) {
      dispatch(updateObject(original));
      throw error;
    }
  });
}
