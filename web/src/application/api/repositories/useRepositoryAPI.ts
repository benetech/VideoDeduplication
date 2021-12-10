import { ListRequest } from "../../../server-api/ServerAPI";
import {
  ComparatorFn,
  stringComparator,
} from "../../../lib/helpers/comparators";
import { Repository, RepositoryFilters } from "../../../model/VideoFile";
import { CreateFn, DeleteFn, UpdateFn } from "../../common/model";
import { useServer } from "../../../server-api/context";
import {
  useCreateEntity,
  useDeleteEntity,
  useUpdateEntity,
} from "../../common/useEntityMutation";

/**
 * Check if the repository satisfies query params.
 */
function checkFilters(
  request: ListRequest<RepositoryFilters>,
  repository: Repository
): boolean {
  const { filters } = request;
  return filters?.name == null || repository.name.includes(filters.name);
}

/**
 * Create repository sort comparator from query params.
 */
function makeComparator(): ComparatorFn<Repository> {
  return (first, second) => stringComparator(first.name, second.name);
}

/**
 * Get a callback to update remote fingerprint repository.
 */
export function useUpdateRepository(): UpdateFn<Repository> {
  const server = useServer();
  const mutation = useUpdateEntity<Repository, RepositoryFilters>({
    updateFn: (repository) => server.repositories.update(repository),
    checkFilters,
    makeComparator,
    updateKeys: ["repositories"],
  });

  return mutation.mutateAsync;
}

/**
 * Get a callback to create remote fingerprint repository.
 */
export function useCreateRepository(): CreateFn<Repository> {
  const server = useServer();
  const mutation = useCreateEntity<Repository, RepositoryFilters>({
    createFn: (repository) => server.repositories.create(repository),
    checkFilters,
    makeComparator,
    updateKeys: ["repositories"],
  });

  return mutation.mutateAsync;
}

/**
 * Get a callback to delete remote fingerprint repository.
 */
export function useDeleteRepository(): DeleteFn<Repository> {
  const server = useServer();
  const mutation = useDeleteEntity<Repository, RepositoryFilters>({
    deleteFn: (repository) => server.repositories.delete(repository),
    checkFilters,
    makeComparator,
    updateKeys: ["repositories"],
  });

  return mutation.mutateAsync;
}

export type UseRepositoryAPI = {
  createRepository: CreateFn<Repository>;
  updateRepository: UpdateFn<Repository>;
  deleteRepository: DeleteFn<Repository>;
};

/**
 * Get repository API.
 */
export default function useRepositoryAPI(): UseRepositoryAPI {
  const createRepository = useCreateRepository();
  const updateRepository = useUpdateRepository();
  const deleteRepository = useDeleteRepository();
  return {
    createRepository,
    updateRepository,
    deleteRepository,
  };
}
