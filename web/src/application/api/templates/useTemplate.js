import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";

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
  const server = useServer();
  const query = useQuery(["template", id], () => server.templates.get(id));
  return {
    template: query.data,
    error: query.error,
    load: query.refetch,
  };
}
