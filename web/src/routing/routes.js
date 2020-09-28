export const routes = {
  home: "/",
  collection: {
    home: "/collection",
    get analytics() {
      return `${this.home}/analytics`;
    },
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
