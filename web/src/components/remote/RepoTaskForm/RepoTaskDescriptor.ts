import { Contributor, Repository } from "../../../model/VideoFile";
import {
  makeMatchRemoteFingerprintsRequest,
  makePullFingerprintsRequest,
  makePushFingerprintsRequest,
  MatchRemoteFingerprintsRequest,
  PullFingerprintsRequest,
  PushFingerprintsRequest,
  TaskRequestType,
} from "../../../model/Task";
import { Nullable } from "../../../lib/types/util-types";

export type RepoTaskRequest =
  | PullFingerprintsRequest
  | PushFingerprintsRequest
  | MatchRemoteFingerprintsRequest;

export type RepoTaskFormProps<
  TRequest extends RepoTaskRequest = RepoTaskRequest
> = {
  repository: Repository;
  contributors: Contributor[];
  request: TRequest;
  onChange: (req: RepoTaskRequest) => void;
  className?: string;
};

/**
 * Create repository task request.
 */
export function makeRepoRequest(
  repo: Nullable<Repository>,
  type: RepoTaskRequest["type"]
): RepoTaskRequest {
  if (repo == null) {
    return makePushFingerprintsRequest();
  }
  switch (type) {
    case TaskRequestType.PULL_FINGERPRINTS:
      return makePullFingerprintsRequest({ repositoryId: repo.id });
    case TaskRequestType.PUSH_FINGERPRINTS:
      return makePushFingerprintsRequest({ repositoryId: repo.id });
    case TaskRequestType.MATCH_REMOTE_FINGERPRINTS:
      return makeMatchRemoteFingerprintsRequest({ repositoryId: repo.id });
  }
}

/**
 * Validate repository task request.
 */
export function validateRepoRequest(request: RepoTaskRequest): boolean {
  switch (request.type) {
    case TaskRequestType.MATCH_REMOTE_FINGERPRINTS:
      return request.contributorName == null || request.repositoryId != null;
    case TaskRequestType.PUSH_FINGERPRINTS:
    case TaskRequestType.PULL_FINGERPRINTS:
      return request.repositoryId > 0;
  }
}
