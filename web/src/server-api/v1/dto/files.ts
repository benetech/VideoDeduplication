import { QueryResultsDTO } from "./query";
import { TextAttributes } from "../../../lib/types/TextAttributes";

export type SceneDTO = {
  id: number;
  duration: number;
  start_time: number;
};

export type ExifDTO = {
  Audio_BitRate: number;
  Audio_Channels: number;
  Audio_Duration: number;
  Audio_Encoded_Date: number;
  Audio_Format: string;
  Audio_SamplingRate: number;
  Audio_Tagged_Date: number;
  Audio_Title: string;
  General_Duration: number;
  General_Encoded_Date: number;
  General_FileExtension: string;
  General_FileSize: number;
  General_File_Modified_Date: number;
  General_File_Modified_Date_Local: number;
  General_Format_Commercial: string;
  General_FrameCount: number;
  General_FrameRate: number;
  General_OverallBitRate: number;
  General_OverallBitRate_Mode: string;
  General_Tagged_Date: number;
  Json_full_exif: { [category: string]: TextAttributes };
  Video_BitRate: number;
  Video_Format: string;
  Video_FrameRate: number;
  Video_Height: number;
  Video_InternetMediaType: string;
  Video_Width: number;
};

export type FileMetadataDTO = {
  flagged: boolean;
  gray_max: number;
  video_dark_flag: boolean;
};

export enum RepositoryType {
  BARE_DATABASE = "BARE_DATABASE",
}

export type RepositoryDTO = {
  id: number;
  name: string;
  address: string;
  login: string;
  type: RepositoryType;
  last_synced: number;
  stats?: {
    partners_count: number;
    total_fingerprints_count: number;
    pushed_fingerprints_count: number;
    pulled_fingerprints_count: number;
  };
};

export type CreateRepositoryDTO = {
  name: string;
  address: string;
  login: string;
  type: RepositoryType;
  credentials: string;
};

export type UpdateRepositoryDTO = {
  name?: string;
};

export type ContributorDTO = {
  id: number;
  name: string;
  repository: RepositoryDTO;
  stats?: {
    total_fingerprints_count: number;
    pulled_fingerprints_count: number;
  };
};

export type CheckRepoCredentialsDTO = {
  confirm_credentials: boolean;
};

export type FileDTO = {
  id: number;
  file_path: string;
  sha256: string;
  created_date: number;
  external: boolean;
  exif?: ExifDTO;
  meta?: FileMetadataDTO;
  scenes: SceneDTO[];
  signature: string;
  contributor?: ContributorDTO;
  related_count?: number;
  duplicates_count?: number;
  matched_templates?: number[];
};

export type FileQueryResultsDTO = QueryResultsDTO<FileDTO> & {
  duplicates: number;
  related: number;
  unique: number;
};
