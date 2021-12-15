import { useHistory } from "react-router-dom";
import { useCallback } from "react";
import { routes } from "./routes";
import getEntityId from "../lib/entity/getEntityId";
import { Entity } from "../lib/entity/Entity";
import { Task } from "../model/Task";
import { Repository, VideoFile } from "../model/VideoFile";

export type EntityRoute<E extends Entity> = (
  entity: E | E["id"] | string
) => void;

/**
 * Create generic routing callback.
 */
function useShowEntityPage<E extends Entity>(
  getURL: (id: E["id"]) => string
): (entity: E | E["id"] | string) => void {
  const history = useHistory();
  return useCallback((entity: E | E["id"]) => {
    history.push(getURL(getEntityId(entity)));
  }, []);
}

/**
 * Get function to navigate to file details page.
 */
export function useShowFile(): EntityRoute<VideoFile> {
  return useShowEntityPage<VideoFile>((id) => routes.collection.fileURL(id));
}

export function useCompareFiles(): (
  motherFile: VideoFile | VideoFile["id"] | string,
  matchFile?: VideoFile | VideoFile["id"] | string
) => void {
  const history = useHistory();
  return useCallback(
    (
      motherFile: VideoFile | VideoFile["id"] | string,
      matchFile?: VideoFile | VideoFile["id"] | string
    ) =>
      history.push(
        routes.collection.fileComparisonURL(
          getEntityId(motherFile),
          getEntityId(matchFile || "")
        )
      ),
    []
  );
}

/**
 * Get function to navigate to file matches page.
 */
export function useShowMatches(): EntityRoute<VideoFile> {
  return useShowEntityPage<VideoFile>((id) =>
    routes.collection.fileMatchesURL(id)
  );
}

/**
 * Get function to navigate to task details page.
 */
export function useShowTask(): EntityRoute<Task> {
  return useShowEntityPage<Task>((id) => routes.processing.taskURL(id));
}

/**
 * Get function to navigate to task logs page.
 */
export function useShowLogs(): EntityRoute<Task> {
  return useShowEntityPage<Task>((id) => routes.processing.taskLogsURL(id));
}

/**
 * Go to the collection root page.
 */
export function useShowCollection(): () => void {
  const history = useHistory();
  return useCallback(() => history.push(routes.collection.home), []);
}

/**
 * Go to the processing root page.
 */
export function useShowProcessing(): () => void {
  const history = useHistory();
  return useCallback(() => history.push(routes.processing.home), []);
}

/**
 * Get function to navigate to repository details page.
 */
export function useShowRepository(): EntityRoute<Repository> {
  return useShowEntityPage<Repository>((id) =>
    routes.collaborators.repositoryURL(id)
  );
}

/**
 * Get function to navigate to repository editing page.
 */
export function useEditRepository(): EntityRoute<Repository> {
  return useShowEntityPage<Repository>((id) =>
    routes.collaborators.editRepositoryURL(id)
  );
}

/**
 * Get function to navigate to repository construction page.
 */
export function useShowCreateRepositoryPage(): () => void {
  const history = useHistory();
  return useCallback(
    () => history.push(routes.collaborators.newRepository),
    []
  );
}

/**
 * Get function to navigate to repositories page.
 */
export function useShowRepositoriesPage(): () => void {
  const history = useHistory();
  return useCallback(() => history.push(routes.collaborators.repositories), []);
}
