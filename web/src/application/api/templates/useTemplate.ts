import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";
import { Template } from "../../../model/Template";

export type UseTemplateResult = {
  template?: Template;
  error: Error | null;
  load: () => void;
};

export default function useTemplate(id: Template["id"]): UseTemplateResult {
  const server = useServer();
  const query = useQuery<Template, Error>(["template", id], () =>
    server.templates.get(id)
  );
  return {
    template: query.data,
    error: query.error,
    load: query.refetch,
  };
}
