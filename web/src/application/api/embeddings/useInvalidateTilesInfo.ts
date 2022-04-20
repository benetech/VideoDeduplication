import { useQueryClient } from "react-query";
import { useCallback } from "react";
import { EmbeddingAlgorithm } from "../../../model/embeddings";

export default function useInvalidateTilesInfo(
  algorithm: EmbeddingAlgorithm
): () => Promise<void> {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries(["tiles", algorithm, "info"]),
    []
  );
}
