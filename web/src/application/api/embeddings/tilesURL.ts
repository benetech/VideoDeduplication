import { EmbeddingAlgorithm } from "../../../model/embeddings";

/**
 * Get tiles URL pattern.
 */
export default function tilesURL(algorithm: EmbeddingAlgorithm): string {
  return `http://localhost:5000/api/v1/embeddings/${algorithm}/tiles/{z}/{x}/{y}`;
}
