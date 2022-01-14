import { Task } from "../model/Task";
import { Repository, VideoFile } from "../model/VideoFile";

/**
 * Expected URL parameters of a single entity page.
 */
export type EntityPageURLParams = {
  id: string;
};

/**
 * Expected URL parameters of file comparison page.
 */
export type ComparisonPageURLParams = {
  id: string;
  matchFileId?: string;
};

export const routes = {
  home: "/",
  analytics: {
    home: "/analytics",
  },
  collection: {
    home: "/collection",

    // Fingerprints Pages

    get fingerprints(): string {
      return `${this.home}/fingerprints`;
    },
    get file(): string {
      return `${this.fingerprints}/:id`;
    },
    get fileMatches(): string {
      return `${this.file}/matches`;
    },
    get fileCluster(): string {
      return `${this.file}/cluster`;
    },
    get fileComparison(): string {
      return `${this.file}/compare/:matchFileId?`;
    },
    fileURL(id: VideoFile["id"] | string): string {
      return `${this.fingerprints}/${id}`;
    },
    fileMatchesURL(id: VideoFile["id"] | string): string {
      return `${this.fileURL(id)}/matches`;
    },
    fileClusterURL(id: VideoFile["id"] | string): string {
      return `${this.fileURL(id)}/cluster`;
    },
    fileComparisonURL(
      id: VideoFile["id"] | string,
      matchFileId: VideoFile["id"] | string = ""
    ): string {
      return `${this.fileURL(id)}/compare/${matchFileId}`;
    },
  },
  database: {
    home: "/database",
  },
  collaborators: {
    home: "/collaborators",

    get repositories(): string {
      return `${this.home}/repositories`;
    },
    get newRepository(): string {
      return `${this.repositories}/new`;
    },
    get repository(): string {
      return `${this.repositories}/:id`;
    },
    repositoryURL(id: Repository["id"] | string): string {
      return `${this.repositories}/${id}`;
    },
    get editRepository(): string {
      return `${this.repository}/edit`;
    },
    editRepositoryURL(id: Repository["id"] | string): string {
      return `${this.repositoryURL(id)}/edit`;
    },
  },
  templates: {
    home: "/templates",
  },
  processing: {
    home: "/processing",

    get task(): string {
      return `${this.home}/tasks/:id`;
    },

    taskURL(id: Task["id"]): string {
      return `${this.home}/tasks/${id}`;
    },

    get taskLogs(): string {
      return `${this.task}/logs`;
    },

    taskLogsURL(id: Task["id"]): string {
      return `${this.taskURL(id)}/logs`;
    },
  },
  external: {
    wiki: "https://github.com/benetech/VideoDeduplication/wiki",
  },
};
