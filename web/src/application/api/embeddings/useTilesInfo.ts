import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";
import { EmbeddingAlgorithm, TilesInfo } from "../../../model/embeddings";
import { Nullable } from "../../../lib/types/util-types";

/**
 * Hook for retrieving tiles metadata.
 */
export default function useTilesInfo(
  algorithm: EmbeddingAlgorithm
): Nullable<TilesInfo> {
  const server = useServer();
  const query = useQuery<TilesInfo>(["tiles", algorithm, "info"], () =>
    server.embeddings.getTileInfo(algorithm)
  );
  return query.data;
}
