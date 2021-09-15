/**
 * File cluster query filters.
 */
export type ClusterFilters = {
  hops?: number;
  minDistance?: number;
  maxDistance?: number;
};

/**
 * Supported file sorting attributes.
 */
export enum FileSort {
  date = "date",
  length = "length",
  related = "related",
  duplicates = "duplicates",
}

/**
 * File query filters.
 */
export type FileFilters = {
  query: string;
  extensions: string[];
  length: {
    lower?: number;
    upper?: number;
  };
  date: {
    lower?: number;
    upper?: number;
  };
  audio?: boolean;
  matches: string;
  sort: FileSort;
  remote: boolean;
  templates: number[];
};

/**
 * File metadata attributes.
 */
export type FileMetadata = {
  uploadedBy?: string;
  updatedDate?: number;
  fileType?: string;
  length?: number;
  frames?: number;
  codec?: string;
  grayMax?: number;
  grayStd?: number;
  stdAverage?: number;
  maxDiff?: number;
  hasEXIF?: boolean;
  hasAudio?: boolean;
  quality?: number;
  flagged?: boolean;
};

/**
 * Remote signature repository types.
 */
export enum RepositoryType {
  BARE_DATABASE = "BARE_DATABASE",
}

/**
 * Remote signature repository.
 */
export type Repository = {
  id: number;
  name: string;
  address: string;
  login: string;
  type: RepositoryType;
};

/**
 * Remote signature-repository contributor.
 */
export type Contributor = {
  id: number;
  name: string;
  repository: Repository;
};

/**
 * Property type for Scene in a video file.
 */
export type Scene = {
  id: number;
  /** Preview URL */
  preview: string;
  /** Scene start time position */
  position: number;
};

/**
 * Video file type.
 */
export type VideoFile = {
  id: number;
  filename: string;
  metadata?: FileMetadata;
  hash: string;
  fingerprint: string;
  preview: string;
  playbackURL: string;
  exif: Object;
  external: boolean;
  contributor?: Contributor;
};
