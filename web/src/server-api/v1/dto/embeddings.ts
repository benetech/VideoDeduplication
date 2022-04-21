import { FileDTO } from "./files";

export type RawEmbeddingAlgorithm = "pacmap" | "trimap" | "umap" | "t-sne";

export type TilesBBoxDTO = {
  x: [number, number];
  y: [number, number];
};

/**
 * Embeddings tiles info.
 */
export type TilesInfoDTO = {
  algorithm: RawEmbeddingAlgorithm;
  available: boolean;
  max_zoom: number | null;
  last_update: string | null;
  bbox: TilesBBoxDTO | null;
  point_size: number | null;
};

/**
 * File Neighbor in embedding space.
 */
export type EmbeddingNeighborDTO = {
  file: FileDTO;
  x: number;
  y: number;
  distance: number;
};
