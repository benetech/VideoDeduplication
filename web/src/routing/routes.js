export const routes = {
  home: "/",
  analytics: {
    home: "/analytics",
  },
  collection: {
    home: "/collection",
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
      return `${this.file}/compare`;
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
  },
};
