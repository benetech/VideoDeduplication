import { FileDTO } from "./files";
import { QueryResultsDTO } from "./query";

export type FileMatchDTO = {
  id: number;
  distance: number;
  false_positive: boolean;
  mother_file_id: number;
  file: FileDTO;
};

export type FileMatchesQueryResultsDTO = QueryResultsDTO<FileMatchDTO> & {
  mother_file: FileDTO;
};

export type MatchDTO = {
  id: number;
  source: number;
  target: number;
  distance: number;
  false_positive: boolean;
};

export type QueryClusterResultsDTO = {
  files: FileDTO[];
  matches: MatchDTO[];
  total: number;
  hops: number;
};

export type UpdateMatchDTO = {
  false_positive?: boolean;
};
