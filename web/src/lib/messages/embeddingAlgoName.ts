import { EmbeddingAlgorithm } from "../../model/embeddings";

export default function embeddingAlgoName(
  algorithm: EmbeddingAlgorithm
): string {
  switch (algorithm) {
    case "pacmap":
      return "PaCMAP";
    case "trimap":
      return "TriMAP";
    case "t-sne":
      return "t-SNE";
    case "umap":
      return "UMAP";
  }
}
