import { EmbeddingNeighborDTO, TilesInfoDTO } from "../dto/embeddings";
import { EmbeddingNeighbor, TilesInfo } from "../../../model/embeddings";
import parse from "date-fns/parse";
import { QueryParams } from "../dto/query";
import { NeighborsRequest } from "../../ServerAPI";
import FilesTransformer from "./FilesTransformer";

export default class EmbeddingsTransformer {
  static readonly defaultDateFormat: string = "yyyy-MM-dd HH:mm:ss.SSSSSS";
  readonly dateFormat: string;
  private readonly fileTransformer: FilesTransformer;

  constructor(dateFormat?: string, fileTransformer?: FilesTransformer) {
    this.dateFormat = dateFormat || EmbeddingsTransformer.defaultDateFormat;
    this.fileTransformer = fileTransformer || new FilesTransformer();
  }

  tilesInfo(data: TilesInfoDTO): TilesInfo {
    const info: TilesInfo = {
      algorithm: data.algorithm,
      available: data.available,
    };
    if (data.max_zoom != null) {
      info.maxZoom = data.max_zoom;
    }
    if (data.last_update != null) {
      info.lastUpdate = parse(data.last_update, this.dateFormat, new Date());
    }
    if (data.bbox != null) {
      const [minX, maxX] = data.bbox.x;
      const [minY, maxY] = data.bbox.y;
      info.bbox = {
        x: { min: minX, max: maxX },
        y: { min: minY, max: maxY },
      };
    }
    if (data.point_size != null) {
      info.pointSize = data.point_size;
    }
    return info;
  }

  neighbors(data: EmbeddingNeighborDTO[]): EmbeddingNeighbor[] {
    return data.map((item) => this.neighbor(item));
  }

  neighbor(data: EmbeddingNeighborDTO): EmbeddingNeighbor {
    return {
      file: this.fileTransformer.file(data.file),
      x: data.x,
      y: data.y,
      distance: data.distance,
    };
  }

  /**
   * Convert neighbors request to query params
   */
  neighborsParams(request: NeighborsRequest): QueryParams {
    return {
      x: request.x,
      y: request.y,
      max_distance: request.maxDistance,
      max_count: request.maxCount,
    };
  }
}
