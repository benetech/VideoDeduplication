import { format as formatDate } from "date-fns";
import parseDate from "../../../lib/helpers/parseDate";

/**
 * Argument and result transformer for file API endpoint.
 */
export default class FilesTransformer {
  constructor() {}

  /**
   * Convert file list filters to query parameters.
   *
   *  @typedef {{
   *   query: string,
   *   extensions: string[],
   *   length: { lower: null|number, upper: null|number },
   *   date: { lower: null|number, upper: null|number },
   *   audio: null|boolean,
   *   matches: string,
   *   sort: string,
   *   remote: null|boolean,
   *   templates: number[],
   * }} FileFilters
   * @param {FileFilters} filters file filters
   * @return {{}} query parameters as object
   */
  listParams(filters) {
    const params = {};
    if (filters?.query) {
      params.path = filters.query;
    }
    if (filters?.audio != null) {
      params.audio = String(!!filters.audio);
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
   *
   * @typedef {{
   *   hops: number|undefined,
   *   minDistance: number|undefined,
   *   maxDistance: number|undefined,
   * }} ClusterFilters
   * @param {ClusterFilters} filters
   * @param {string[]} fields
   * @return {{}} cluster query parameters
   */
  clusterParams(filters, fields) {
    const params = {};
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
   *
   * @typedef {{
   *   remote: boolean|null,
   *   falsePositive: boolean|null,
   *   sort: string,
   *   sortDirection: string,
   * }} FileMatchFilters
   * @param {FileMatchFilters} filters
   * @param {string[]} fields
   * @return {{}} file matches query parameters
   */
  matchesParams(filters, fields) {
    const params = {};
    if (fields != null && fields.length > 0) {
      params.include = fields.join(",");
    }
    if (filters?.remote != null) {
      params.remote = !!filters.remote;
    }
    if (filters?.falsePositive != null) {
      params.false_positive = !!filters.falsePositive;
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
   * @param data server response
   * @return {{files: [*], counts}} list files results
   */
  files(data) {
    const counts = {
      all: data.total,
      duplicates: data.duplicates,
      related: data.related,
      unique: data.unique,
    };

    const files = data.items.map((post) => this.file(post));
    return { files, counts };
  }

  /**
   * Transform file DTO to file object.
   * @param data file DTO as object
   * @return {any} transformed file
   */
  file(data) {
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
      matchesCount: data.matches_count,
      external: data.contributor != null,
      contributor: this._contributor(data.contributor),
    };
  }

  /**
   * Transform file neighbors cluster.
   * @param data server response.
   * @return {{total, files, matches}}
   */
  cluster(data) {
    return {
      total: data.total,
      matches: data.matches.map((match) => this._clusterMatch(match)),
      files: data.files.map((file) => this.file(file)),
    };
  }

  /**
   * Transform list file matches results.
   * @param data server response
   * @return {{total, offset, matches}}
   */
  matches(data) {
    return {
      offset: data.offset,
      total: data.total,
      matches: data.items.map((match) => this.match(match, data.mother_file)),
    };
  }

  /**
   * Transform file match DTO to file match object.
   * @param match file match DTO
   * @param motherFile file DTO
   * @return {{}} file match object
   */
  match(match, motherFile) {
    return {
      id: match.id,
      distance: match.distance,
      motherFile: { id: match.mother_file_id, ...motherFile },
      file: this.file(match.file),
      falsePositive: match.false_positive,
    };
  }

  _creationDate(data) {
    const value = data?.exif?.General_Encoded_Date;
    if (value == null) {
      return null;
    }
    return new Date(value * 1000);
  }

  _metadata(data) {
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

  _type(file) {
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

  _scene(scene, file) {
    return {
      preview: `/api/v1/files/${file.id}/thumbnail?time=${scene.start_time}`,
      position: scene.start_time * 1000,
      duration: scene.duration * 1000,
    };
  }

  _scenes(file) {
    const scenes =
      file.scenes && file.scenes.map((scene) => this._scene(scene, file));
    if (!scenes || scenes.length === 0) {
      return [
        {
          preview: `/api/v1/files/${file.id}/thumbnail?time=0`,
          position: 0,
          duration: (file.meta && file.meta.video_length * 1000) || 0,
        },
      ];
    }
    return scenes;
  }

  _clusterMatch(match) {
    return { ...match }; // No difference at the moment
  }

  _contributor(data) {
    if (data == null) {
      return undefined;
    }
    return {
      id: data.id,
      name: data.name,
      repository: this._repository(data.repository),
    };
  }

  _repository(data) {
    if (data == null) {
      return undefined;
    }
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      login: data.login,
      type: data.type,
    };
  }
}
