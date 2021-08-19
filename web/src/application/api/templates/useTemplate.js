import { useDispatch, useSelector } from "react-redux";
import { selectCachedTemplate } from "../../state/root/selectors";
import { useServer } from "../../../server-api/context";
import { useCallback, useEffect, useState } from "react";
import ServerError from "../../../server-api/Server/ServerError";
import handleError from "../../../lib/helpers/handleError";
import { cacheTemplate } from "../../state/templates/cache/actions";

/**
 * Hook to get template by id.
 * @param {string|number} id
 * @param {boolean} raise if false, load callback will not throw exceptions
 * @return {{
 *   template: TemplateEntity,
 *   error: boolean,
 *   load: function,
 * }}
 */
export default function useTemplate(id, raise = false) {
  const dispatch = useDispatch();
  const template = useSelector(selectCachedTemplate(id));
  const server = useServer();
  const [error, setError] = useState();

  const load = useCallback(async () => {
    try {
      setError(null);
      const template = await server.templates.get(id);
      dispatch(cacheTemplate(template));
      return template;
    } catch (error) {
      setError({ status: error.code || ServerError.CLIENT_ERROR });
      handleError(raise, error);
    }
  }, [id]);

  // Autoload template
  useEffect(() => {
    if (template != null) {
      // Cache hit! Update cache history.
      dispatch(cacheTemplate(template));
    } else {
      // Otherwise trigger template loading.
      load().catch(console.error);
    }
  }, [id, template]);

  return {
    template,
    error,
    load,
  };
}
