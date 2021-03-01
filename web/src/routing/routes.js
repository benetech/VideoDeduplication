export const routes = {
  home: "/",
  analytics: {
    home: "/analytics",
  },
  collection: {
    home: "/collection",

    // Fingerprints Pages

    get fingerprints() {
      return `${this.home}/fingerprints`;
    },
    get file() {
      return `${this.fingerprints}/:id`;
    },
    get fileMatches() {
      return `${this.file}/matches`;
    },
    get fileCluster() {
      return `${this.file}/cluster`;
    },
    get fileComparison() {
      return `${this.file}/compare/:matchFileId?`;
    },
    fileURL(id) {
      return `${this.fingerprints}/${id}`;
    },
    fileMatchesURL(id) {
      return `${this.fileURL(id)}/matches`;
    },
    fileClusterURL(id) {
      return `${this.fileURL(id)}/cluster`;
    },
    fileComparisonURL(id, matchFileId = "") {
      return `${this.fileURL(id)}/compare/${matchFileId}`;
    },
  },
  database: {
    home: "/database",
  },
  collaborators: {
    home: "/collaborators",
  },
  organization: {
    home: "/organization",
  },
  processing: {
    home: "/processing",

    get task() {
      return `${this.home}/tasks/:id`;
    },

    taskURL(id) {
      return `${this.home}/tasks/${id}`;
    },

    get taskLogs() {
      return `${this.task}/logs`;
    },

    taskLogsURL(id) {
      return `${this.taskURL(id)}/logs`;
    },
  },
  external: {
    wiki: "https://github.com/benetech/VideoDeduplication/wiki",
  },
};
