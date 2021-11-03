import { format as formatDate } from "date-fns";
import MatchesTransformer from "./MatchesTransformer";
import parseDate from "../../../lib/helpers/parseDate";
import { QueryParams } from "../dto/query";
import {
  ClusterFilters,
  Contributor,
  FileFilters,
  FileMetadata,
  Repository,
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
  QueryClusterRequest,
  QueryClusterResults,
  QueryFileMatchesRequest,
  QueryFileMatchesResults,
} from "../../ServerAPI";
import {
  ContributorDTO,
  FileDTO,
  FileQueryResultsDTO,
  RepositoryDTO,
  SceneDTO,
} from "../dto/files";
import {
  FileMatchDTO,
  FileMatchesQueryResultsDTO,
  MatchDTO,
  QueryClusterResultsDTO,
} from "../dto/matches";

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

    const files = response.items.map((post) => this.file(post));
    return { request, total: counts.all, items: files, counts };
  }

  /**
   * Transform file DTO to file object.
   */
  file(data: FileDTO): VideoFile {
    const meta = this._metadata(data);
    return {
      id: data.id,
      filename: data.file_path,
      metadata: {
        fileType: this._type(data),
        hasAudio: data.exif && !!data.exif.Audio_Format,
        // Always false, until exif is actually extracted
        // TODO: https://github.com/benetech/VideoDeduplication/issues/313
        hasEXIF: false,
        created: this._creationDate(data),
        ...meta,
      },
      hash: data.sha256,
      fingerprint: data.signature,
      exif: data.exif,
      preview: `/api/v1/files/${data.id}/thumbnail?time=0`,
      playbackURL: `/api/v1/files/${data.id}/watch`,
      scenes: this._scenes(data),
      relatedCount: data.related_count,
      duplicatesCount: data.duplicates_count,
      matchedTemplateIds: data.matched_templates,
      external: data.contributor != null,
      contributor: this._contributor(data.contributor),
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
      matches: data.matches.map((match) => this._clusterMatch(match)),
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

  _creationDate(data: FileDTO): Date | undefined {
    const value = data?.exif?.General_Encoded_Date;
    if (value == null) {
      return;
    }
    return new Date(value * 1000);
  }

  _metadata(data: FileDTO): FileMetadata {
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

  _type(file: FileDTO): string | undefined {
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

  _scene(scene: SceneDTO, file: FileDTO): Scene {
    return {
      id: scene.id,
      preview: `/api/v1/files/${file.id}/thumbnail?time=${
        scene.start_time * 1000
      }`,
      position: scene.start_time * 1000,
      duration: scene.duration * 1000,
    };
  }

  _scenes(file: FileDTO): Scene[] {
    const scenes =
      file.scenes && file.scenes.map((scene) => this._scene(scene, file));
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

  _clusterMatch(match: MatchDTO): Match {
    return this.matchTransform.match(match);
  }

  _contributor(data: ContributorDTO | undefined): Contributor | undefined {
    if (data == null) {
      return undefined;
    }
    return {
      id: data.id,
      name: data.name,
      repository: this._repository(data.repository),
    };
  }

  _repository(data: RepositoryDTO): Repository {
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      login: data.login,
      type: data.type,
    };
  }
}
