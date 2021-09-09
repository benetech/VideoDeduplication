import { useServer } from "../../../server-api/context";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cacheTemplateFileExclusions,
  createTemplateFileExclusion,
  deleteTemplateFileExclusion,
} from "../../state/file-exclusions/actions";
import { selectFileExclusionsCache } from "../../state/root/selectors";
import { selectFileExclusions } from "../../state/file-exclusions/selectors";
import OperationMutex from "../../common/helpers/OperationMutex";
import extendEntityList from "../../common/helpers/extendEntityList";

/**
 * This class provides API for React components to work
 * with template file exclusions.
 */
export default class FileExclusionAPI {
  /**
   * React hook to obtain FileExclusion API
   */
  static use() {
    const server = useServer();
    const dispatch = useDispatch();
    return useMemo(
      () => new FileExclusionAPI(server, dispatch),
      [server, dispatch]
    );
  }

  /**
   * @param {Server} server
   * @param {function} dispatch
   * @param {function} selectCache
   */
  constructor(server, dispatch, selectCache) {
    this.selectCache = selectCache || selectFileExclusionsCache;
    this.server = server;
    this.dispatch = dispatch;
  }

  async createExclusion(exclusion) {
    const created = await this.server.templateExclusions.create(exclusion);
    this.dispatch(createTemplateFileExclusion(created));
  }

  async deleteExclusion(exclusion) {
    try {
      this.dispatch(deleteTemplateFileExclusion(exclusion));
      await this.server.templateExclusions.delete(exclusion);
    } catch (error) {
      this.dispatch(createTemplateFileExclusion(exclusion));
      throw error;
    }
  }

  /**
   * Get black-listed templates for the given file.
   *
   * As file-exclusion list is always reasonably small, we can simply
   * load it entirely at once.
   */
  useExclusions(fileId) {
    // Get cached exclusions
    const selectExclusions = selectFileExclusions(this.selectCache, fileId);
    const exclusions = useSelector(selectExclusions);

    // Define state for exclusion loading
    const operation = useMemo(() => new OperationMutex());
    const [error, setError] = useState(false);
    const [progress, setProgress] = useState(
      exclusions != null ? 1 : undefined
    );

    const loadExclusions = useCallback(() => {
      let cancelled = false;

      // Define a method to cancel the operation
      const cancel = () => {
        cancelled = true;
      };

      // Define loading procedure
      const doLoadExclusions = async () => {
        setError(false);
        let currentExclusions = [];
        let currentTotal = undefined;

        let hasMore = true;
        while (!cancelled && hasMore) {
          // Fetch next slice of exclusions
          const response = await this.server.templateExclusions.list({
            offset: currentExclusions.length,
            filters: { fileId },
          });

          const { items: newExclusions, total: newTotal } = response;

          // Update loaded exclusion collection
          currentExclusions = extendEntityList(
            currentExclusions,
            newExclusions
          );
          currentTotal = newTotal;
          hasMore = currentExclusions.length < currentTotal;

          if (!cancel) {
            setProgress(Math.min(currentExclusions.length / currentTotal, 1));
          }
        }

        return currentExclusions;
      };

      // Do load exclusions
      doLoadExclusions()
        .then((results) => {
          if (!cancelled) {
            setProgress(1);
            this.dispatch(cacheTemplateFileExclusions(fileId, results));
          }
        })
        .catch((error) => {
          console.error("Error loading template-file exclusions.", error);
          if (!cancelled) {
            setError(true);
          }
        });

      operation.begin(cancel);
    }, [fileId]);

    // Load exclusions if needed for each file id
    useEffect(() => {
      if (exclusions == null) {
        loadExclusions();
      }
    }, [fileId]);

    // Cancel operation when component is unmounted
    useEffect(() => () => operation.cancel(), []);

    return {
      exclusions: exclusions || [],
      progress,
      hasMore: progress !== 1,
      error,
      load: loadExclusions,
    };
  }
}
