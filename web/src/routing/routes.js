export const routes = {
  home: "/",
  collection: {
    home: "/collection",
    analytics: "/collection/analytics",
    fingerprints: "/collection/fingerprints",
    video: "/collection/fingerprints/:id",
    videoURL(id) {
      return `${this.fingerprints}/${id}`;
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
