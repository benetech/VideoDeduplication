import { VideoFile } from "./VideoFile";

export type EmbeddingAlgorithm = "pacmap" | "trimap" | "umap" | "t-sne";

export const EmbeddingAlgorithms: readonly EmbeddingAlgorithm[] = Object.freeze(
  ["trimap", "pacmap", "t-sne", "umap"]
);

/**
 * Bounding box of the embedding space.
 */
export type TilesBBox = {
  x: { min: number; max: number };
  y: { min: number; max: number };
};

/**
 * Embeddings tiles info.
 */
export type TilesInfo = {
  algorithm: EmbeddingAlgorithm;
  available: boolean;
  maxZoom?: number;
  lastUpdate?: Date;
  bbox?: TilesBBox;
  pointSize?: number;
};

/**
 * Embedding space coords.
 */
export type EmbeddingCoords = {
  x: number;
  y: number;
};

/**
 * Neighboring file in embedding space.
 */
export type EmbeddingNeighbor = {
  file: VideoFile;
  x: number;
  y: number;
  distance: number;
};
