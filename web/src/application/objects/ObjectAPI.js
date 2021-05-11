import { useServer } from "../../server-api/context";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { selectObjectCache } from "../../collection/state/selectors";
import { cacheObjects, updateObject } from "./state/actions";
import { selectFileObjects } from "./state/selectors";
import { updateMatch } from "../../collection/state/fileMatches/actions";

/**
 * This class provides API for React components to consistently
 * work with detected objects (template-matches).
 */
export default class ObjectAPI {
  /**
   * React hook to obtain MatchAPI
   */
  static use() {
    const server = useServer();
    const dispatch = useDispatch();
    return useMemo(() => new ObjectAPI(server, dispatch), [server, dispatch]);
  }

  constructor(server, dispatch, selectCache) {
    this.selectCache = selectCache || selectObjectCache;
    this.server = server;
    this.dispatch = dispatch;
  }

  /**
   * Update object.
   */
  async updateObject(updated, original) {
    if (updated.id !== original?.id) {
      throw new Error(
        `Original object has different id: ${updated.id} != ${original?.id}`
      );
    }
    try {
      this.dispatch(updateObject(updated));
      await this.server.updateTemplateMatch(updated);
    } catch (error) {
      this.dispatch(updateMatch(original));
      throw error;
    }
  }

  /**
   * Get all the detected objects for the given file at once.
   */
  useFileObjects(fileId) {
    const objects = useSelector(selectFileObjects(fileId, this.selectCache));
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
          const response = await this.server.fetchTemplateMatches({
            offset: currentObjects.length,
            filters: { fileId },
            fields: ["template"],
          });

          const {
            templateMatches: newObjects,
            templates: newTemplates,
            total: newTotal,
          } = response;

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
          this.dispatch(cacheObjects(fileId, currentObjects));
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
}
