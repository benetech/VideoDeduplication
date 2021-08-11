import lodash from "lodash";
import { useHistory } from "react-router-dom";
import { useCallback } from "react";
import { routes } from "./routes";
import getEntityId from "../lib/helpers/getEntityId";

/**
 * Resolve routing target entity.
 * @param {*} value
 * @param {function|Object|undefined} override
 * @return {Entity|string|number}
 */
function resolveTarget(value, override) {
  if (override == null) {
    return value;
  } else if (lodash.isFunction(override)) {
    return override(value);
  } else {
    return override;
  }
}

/**
 * Create generic routing callback.
 * @param {function} getURL
 * @param {function|Object|undefined} override
 * @param {[*]|undefined} deps
 * @return {(function(*=): void)|*}
 */
function useShowEntityPage(getURL, override, deps) {
  const history = useHistory();
  return useCallback((value) => {
    const targetEntity = resolveTarget(value, override);
    history.push(getURL(getEntityId(targetEntity)));
  }, deps);
}

/**
 * Get function to navigate to file details page.
 * @param {function|Object|undefined} override
 * @param {[*]|undefined} deps
 * @return {(function(*=): void)|*}
 */
export function useShowFile(override, deps) {
  return useShowEntityPage(
    (id) => routes.collection.fileURL(id),
    override,
    deps
  );
}

export function useCompareFiles(override, deps) {
  const history = useHistory();
  return useCallback((value) => {
    const target = resolveTarget(value, override);
    if (lodash.isArray(target)) {
      const [motherFile, matchFile] = target;
      history.push(
        routes.collection.fileComparisonURL(
          getEntityId(motherFile),
          getEntityId(matchFile || "")
        )
      );
    } else {
      history.push(routes.collection.fileComparisonURL(getEntityId(target)));
    }
  }, deps);
}

/**
 * Get function to navigate to file matches page.
 * @param {function|Object|undefined} override
 * @param {[*]|undefined} deps
 * @return {(function(*=): void)|*}
 */
export function useShowMatches(override, deps) {
  return useShowEntityPage(
    (id) => routes.collection.fileMatchesURL(id),
    override,
    deps
  );
}

/**
 * Get function to navigate to task details page.
 * @param {function|Object|undefined} override
 * @param {[*]|undefined} deps
 * @return {(function(*=): void)|*}
 */
export function useShowTask(override, deps) {
  return useShowEntityPage(
    (id) => routes.processing.taskURL(id),
    override,
    deps
  );
}

/**
 * Get function to navigate to task logs page.
 * @param {function|Object|undefined} override
 * @param {[*]|undefined} deps
 * @return {(function(*=): void)|*}
 */
export function useShowLogs(override, deps) {
  return useShowEntityPage(
    (id) => routes.processing.taskLogsURL(id),
    override,
    deps
  );
}

/**
 * Go to the collection root page.
 * @return {function(): void}
 */
export function useShowCollection() {
  const history = useHistory();
  return useCallback(() => history.push(routes.collection.home));
}

/**
 * Go to the processing root page.
 * @return {function(): void}
 */
export function useShowProcessing() {
  const history = useHistory();
  return useCallback(() => history.push(routes.processing.home));
}
