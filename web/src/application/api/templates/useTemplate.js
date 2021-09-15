import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";

/**
 * Hook to get template by id.
 * @param {string|number} id
 * @return {{
 *   template: TemplateEntity,
 *   error: boolean,
 *   load: function,
 * }}
 */
export default function useTemplate(id) {
  const server = useServer();
  const query = useQuery(["template", id], () => server.templates.get(id));
  return {
    template: query.data,
    error: query.error,
    load: query.refetch,
  };
}
