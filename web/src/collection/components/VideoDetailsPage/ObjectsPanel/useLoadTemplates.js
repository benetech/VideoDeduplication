import { useEffect } from "react";
import loadTemplates from "../../TemplatesPage/loadTemplates";
import { setTemplates } from "../../../../application/state/templates/actions";
import { useDispatch, useSelector } from "react-redux";
import { selectTemplates } from "../../../../application/state/root/selectors";
import { useServer } from "../../../../server-api/context";

/**
 * Hook to load all defined templates.
 */
export default function useLoadTemplates() {
  const dispatch = useDispatch();
  const templates = useSelector(selectTemplates).templates;
  const server = useServer();
  useEffect(() => {
    if (templates.length === 0) {
      loadTemplates(server).then((templates) =>
        dispatch(setTemplates(templates))
      );
    }
  }, []);

  return templates;
}
