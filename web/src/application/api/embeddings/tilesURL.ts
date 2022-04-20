import { EmbeddingAlgorithm } from "../../../model/embeddings";

/**
 * Get tiles URL pattern.
 */
export default function tilesURL(algorithm: EmbeddingAlgorithm): string {
  return `/api/v1/embeddings/${algorithm}/tiles/{z}/{x}/{y}`;
}
