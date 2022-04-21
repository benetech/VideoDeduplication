import {
  EmbeddingAlgorithm,
  EmbeddingNeighbor,
} from "../../../model/embeddings";
import { useServer } from "../../../server-api/context";
import { useQuery } from "react-query";
import { Nullable } from "../../../lib/types/util-types";

type UseNeighborsOptions = {
  algorithm: EmbeddingAlgorithm;
  x: number;
  y: number;
  maxDistance: number;
  maxCount: number;
};

export default function useNeighbors(
  options: UseNeighborsOptions
): Nullable<EmbeddingNeighbor[]> {
  const { algorithm, x, y, maxCount, maxDistance } = options;
  const server = useServer();
  const query = useQuery<EmbeddingNeighbor[]>(
    ["embeddings", algorithm, "neighbors", { x, y, maxDistance, maxCount }],
    () => server.embeddings.getNeighbors(options)
  );
  return query.data;
}
