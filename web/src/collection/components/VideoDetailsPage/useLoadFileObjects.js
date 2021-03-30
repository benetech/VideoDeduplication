import { useDispatch, useSelector } from "react-redux";
import { selectCachedObjects } from "../../state/selectors";
import { useEffect, useState } from "react";
import { cacheObjects } from "../../state/objectCache/actions";
import { useServer } from "../../../server-api/context";

/**
 * Load video objects for the given file.
 */
export default function useLoadFileObjects(fileId) {
  const server = useServer();
  const dispatch = useDispatch();
  const objects = useSelector(selectCachedObjects(fileId));
  const [progress, setProgress] = useState(objects != null ? 1 : undefined);

  useEffect(() => {
    // Handle cache hit
    if (objects != null) {
      setProgress(1);
      return;
    }

    // Otherwise initialize status
    setProgress(undefined);

    // Define cancel flag
    let cancel = false;

    // Objects loading routine
    const loadObjects = async () => {
      let currentObjects = [];
      let currentTotal = undefined;
      const templatesCache = new Map();

      let hasMore = true;
      while (!cancel && hasMore) {
        // Fetch next slice of objects
        const response = await server.fetchTemplateMatches({
          offset: currentObjects.length,
          filters: { fileId },
          fields: ["template"],
        });

        if (response.failure) {
          throw response.error;
        }

        const {
          templateMatches: newObjects,
          templates: newTemplates,
          total: newTotal,
        } = response.data;

        // Update template cache
        for (const template of newTemplates) {
          templatesCache.set(template.id, template);
        }

        // Wire templates and files into loaded objects
        const wiredObjects = newObjects.map((object) => ({
          ...object,
          template: templatesCache.get(object.templateId),
        }));

        // Update loaded objects collection
        currentObjects = currentObjects.concat(wiredObjects);
        currentTotal = newTotal;
        hasMore = currentObjects.length < currentTotal;
        if (!cancel) {
          setProgress(Math.min(currentObjects.length / currentTotal, 1));
        }
      }

      if (!cancel) {
        setProgress(1);
        dispatch(cacheObjects(fileId, currentObjects));
      }
    };

    loadObjects().catch((error) =>
      console.error("Error loading objects", error)
    );

    return () => {
      cancel = true;
    };
  }, [fileId, objects]);

  const done = progress === 1;
  if (done) {
    return { progress, done, objects };
  }
  // Do not return objects if not done to let
  // client code use default restructuring.
  return { progress, done };
}
