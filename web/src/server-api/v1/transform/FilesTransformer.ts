import { format as formatDate } from "date-fns";
import MatchesTransformer from "./MatchesTransformer";
import parseDate from "../../../lib/helpers/parseDate";
import { QueryParams, QueryResultsDTO } from "../dto/query";
import {
  ClusterFilters,
  Contributor,
  ContributorFilters,
  FileFilters,
  FileMetadata,
  Repository,
  RepositoryFilters,
  RepositoryPrototype,
  Scene,
  VideoFile,
} from "../../../model/VideoFile";
import {
  FileMatch,
  Match,
  MatchCounts,
  MatchQueryFilters,
} from "../../../model/Match";
import {
  ListFilesResults,
  ListRequest,
  ListResults,
  QueryClusterRequest,
  QueryClusterResults,
  QueryFileMatchesRequest,
  QueryFileMatchesResults,
} from "../../ServerAPI";
import {
  ContributorDTO,
  CreateRepositoryDTO,
  FileDTO,
  FileQueryResultsDTO,
  RepositoryDTO,
  SceneDTO,
  UpdateRepositoryDTO,
} from "../dto/files";
import {
  FileMatchDTO,
  FileMatchesQueryResultsDTO,
  MatchDTO,
  QueryClusterResultsDTO,
} from "../dto/matches";
import { Updates } from "../../../lib/entity/Entity";
import thumbnailURL from "../../../application/api/files/helpers/thumbnailURL";

/**
 * Argument and result transformer for file API endpoint.
 */
export default class FilesTransformer {
  private readonly matchTransform: MatchesTransformer;

  constructor(matchTransform?: MatchesTransformer) {
    this.matchTransform = matchTransform || new MatchesTransformer();
  }

  /**
   * Convert file list filters to query parameters.
   */
  listParams(filters?: FileFilters): QueryParams {
    const params: QueryParams = {};
    if (filters?.query) {
      params.path = filters.query;
    }
    if (filters?.audio != null) {
      params.audio = Boolean(filters.audio);
    }
    if (filters?.length?.lower != null) {
      params.min_length = filters.length.lower * 60000; // minutes to milliseconds
    }
    if (filters?.length?.upper != null) {
      params.max_length = filters.length.upper * 60000; // minutes to milliseconds
    }
    if (filters?.date?.lower != null) {
      params.date_from = formatDate(
        parseDate(filters.date.lower),
        "yyyy-MM-dd"
      );
    }
    if (filters?.date?.upper != null) {
      params.date_to = formatDate(parseDate(filters.date.upper), "yyyy-MM-dd");
    }
    if (filters?.extensions && filters?.extensions?.length > 0) {
      const extensions = filters.extensions
        .map((ext) => ext.trim())
        .filter((ext) => ext.length > 0);
      if (extensions.length > 0) {
        params.extensions = extensions.join(",");
      }
    }
    if (filters?.matches != null) {
      params.matches = filters.matches;
    }
    if (filters?.sort) {
      params.sort = filters.sort;
    }
    if (filters?.remote != null) {
      params.remote = filters.remote;
    }
    if (filters?.templates != null && filters.templates.length > 0) {
      params.templates = filters.templates.join(",");
    }
    if (filters?.contributors != null && filters.contributors.length > 0) {
      params.contributors = filters.contributors.join(",");
    }
    if (
      filters?.semantic.query != null &&
      filters?.semantic.query.trim().length > 0
    ) {
      params.semantic_query = filters.semantic.query.trim();
    }
    if (filters?.semantic.maxHits != null) {
      params.max_semantic_search_hits = filters.semantic.maxHits;
    }
    if (filters?.semantic.minSimilarity != null) {
      params.min_semantic_similarity = filters.semantic.minSimilarity;
    }
    return params;
  }

  /**
   * Convert cluster filters to query params.
   */
  clusterParams(filters?: ClusterFilters, fields?: string[]): QueryParams {
    const params: QueryParams = {};
    if (filters?.hops != null) {
      params.hops = filters.hops;
    }
    if (filters?.minDistance != null) {
      params.min_distance = filters.minDistance;
    }
    if (filters?.maxDistance != null) {
      params.max_distance = filters.maxDistance;
    }
    if (fields != null && fields.length > 0) {
      params.include = fields.join(",");
    }
    return params;
  }

  /**
   * Convert file matches filters to query params.
   */
  matchesParams(filters: MatchQueryFilters, fields: string[]): QueryParams {
    const params: QueryParams = {};
    if (fields != null && fields.length > 0) {
      params.include = fields.join(",");
    }
    if (filters?.remote != null) {
      params.remote = Boolean(filters.remote);
    }
    if (filters?.falsePositive != null) {
      params.false_positive = Boolean(filters.falsePositive);
    }
    if (filters?.sort != null) {
      params.sort = filters.sort;
    }
    if (filters?.sortDirection != null) {
      params.sort_direction = filters.sortDirection;
    }
    return params;
  }

  /**
   * Convert repository filters to query params.
   */
  repositoriesParams(filters: RepositoryFilters): QueryParams {
    const params: QueryParams = {};
    if (filters.name != null && filters.name.length > 0) {
      params.name = filters.name.trim();
    }
    return params;
  }

  /**
   * Convert contributor filters to query params.
   */
  contributorsParams(filters: ContributorFilters): QueryParams {
    const params: QueryParams = {};
    if (filters.name != null && filters.name.length > 0) {
      params.name = filters.name.trim();
    }
    if (filters.repositoryId != null) {
      params.repository_id = filters.repositoryId;
    }
    return params;
  }

  /**
   * Transform list files results.
   */
  files(
    response: FileQueryResultsDTO,
    request: ListRequest<FileFilters>
  ): ListFilesResults {
    const counts: MatchCounts = {
      all: response.total,
      duplicates: response.duplicates,
      related: response.related,
      unique: response.unique,
    };

    const files = response.items.map((fileDTO) => this.file(fileDTO));
    return { request, total: counts.all, items: files, counts };
  }

  /**
   * Transform file DTO to file object.
   */
  file(data: FileDTO): VideoFile {
    const meta = this.metadata(data);
    return {
      id: data.id,
      filename: data.file_path,
      metadata: {
        fileType: this.type(data),
        hasAudio: data.exif && !!data.exif.Audio_Format,
        // Always false, until exif is actually extracted
        // TODO: https://github.com/benetech/VideoDeduplication/issues/313
        hasEXIF: false,
        created: this.creationDate(data),
        ...meta,
      },
      hash: data.sha256,
      fingerprint: data.signature,
      exif: data.exif,
      preview: thumbnailURL(data.id, meta.length / 2),
      playbackURL: `/api/v1/files/${data.id}/watch`,
      scenes: this.scenes(data),
      relatedCount: data.related_count,
      duplicatesCount: data.duplicates_count,
      matchedTemplateIds: data.matched_templates,
      external: data.contributor != null,
      contributor:
        data.contributor != null
          ? this.contributor(data.contributor)
          : undefined,
    };
  }

  /**
   * Transform file neighbors cluster.
   */
  cluster(
    data: QueryClusterResultsDTO,
    request: QueryClusterRequest
  ): QueryClusterResults {
    return {
      request,
      total: data.total,
      matches: data.matches.map((match) => this.clusterMatch(match)),
      files: data.files.map((file) => this.file(file)),
    };
  }

  /**
   * Transform list file matches results.
   */
  matches(
    data: FileMatchesQueryResultsDTO,
    request: QueryFileMatchesRequest
  ): QueryFileMatchesResults {
    return {
      request,
      total: data.total,
      items: data.items.map((match) => this.match(match, data.mother_file)),
    };
  }

  /**
   * Transform file match DTO to file match object.
   */
  match(match: FileMatchDTO, motherFile: FileDTO): FileMatch {
    return {
      id: match.id,
      distance: match.distance,
      motherFile: this.file(motherFile),
      file: this.file(match.file),
      falsePositive: match.false_positive,
    };
  }

  private creationDate(data: FileDTO): Date | undefined {
    const value = data?.exif?.General_Encoded_Date;
    if (value == null) {
      return;
    }
    return new Date(value * 1000);
  }

  private metadata(data: FileDTO): FileMetadata {
    if (!data.meta) {
      return {
        length: data.exif?.General_Duration || 0,
      };
    }
    return {
      grayMax: data.meta.gray_max,
      flagged: data.meta.flagged,
      length: data.exif?.General_Duration || 0,
    };
  }

  private type(file: FileDTO): string | undefined {
    if (file.exif && file.exif.General_FileExtension) {
      return file.exif.General_FileExtension;
    }
    const match = file.file_path?.match(/\.([^/.]+)$/);
    if (match && match[1]) {
      return match[1];
    } else {
      return undefined;
    }
  }

  private scene(scene: SceneDTO, file: FileDTO): Scene {
    return {
      id: scene.id,
      preview: `/api/v1/files/${file.id}/thumbnail?time=${
        scene.start_time * 1000
      }`,
      position: scene.start_time * 1000,
      duration: scene.duration * 1000,
    };
  }

  private scenes(file: FileDTO): Scene[] {
    const scenes =
      file.scenes && file.scenes.map((scene) => this.scene(scene, file));
    if (!scenes || scenes.length === 0) {
      return [
        {
          id: 0,
          preview: `/api/v1/files/${file.id}/thumbnail?time=0`,
          position: 0,
          duration: file.exif?.General_Duration || 0,
        },
      ];
    }
    return scenes;
  }

  private clusterMatch(match: MatchDTO): Match {
    return this.matchTransform.match(match);
  }

  contributors(
    response: QueryResultsDTO<ContributorDTO>,
    request: ListRequest<ContributorFilters>
  ): ListResults<Contributor, ContributorFilters> {
    return {
      request,
      total: response.total,
      items: response.items.map((contribDTO) => this.contributor(contribDTO)),
    };
  }

  contributor(data: ContributorDTO): Contributor {
    return {
      id: data.id,
      name: data.name,
      repository: this.repository(data.repository),
      stats: {
        totalFingerprintsCount: data.stats?.total_fingerprints_count || 0,
        pulledFingerprintsCount: data.stats?.pulled_fingerprints_count || 0,
      },
    };
  }

  repositories(
    response: QueryResultsDTO<RepositoryDTO>,
    request: ListRequest<RepositoryFilters>
  ): ListResults<Repository, RepositoryFilters> {
    return {
      request,
      total: response.total,
      items: response.items.map((repoDTO) => this.repository(repoDTO)),
    };
  }

  repository(data: RepositoryDTO): Repository {
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      login: data.login,
      type: data.type,
      lastSynced:
        data.last_synced != null ? new Date(data.last_synced) : undefined,
      stats: {
        partnersCount: data.stats?.partners_count || 0,
        totalFingerprintsCount: data.stats?.total_fingerprints_count || 0,
        pushedFingerprintsCount: data.stats?.pushed_fingerprints_count || 0,
        pulledFingerprintsCount: data.stats?.pulled_fingerprints_count || 0,
      },
    };
  }

  createRepositoryDTO(repository: RepositoryPrototype): CreateRepositoryDTO {
    return {
      ...repository,
    };
  }

  updateRepositoryDTO(repository: Updates<Repository>): UpdateRepositoryDTO {
    return {
      name: repository.name,
    };
  }
}
