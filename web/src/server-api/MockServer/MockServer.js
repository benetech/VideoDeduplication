import { fakeFiles } from "./fake-data/files";

export default class MockServer {
  constructor() {}

  async fetchFiles({ page, pageSize }) {
    const start = page * pageSize;
    const files = fakeFiles.slice(start, start + pageSize);
    const counts = {
      total: fakeFiles.length,
      duplicates: 0,
      related: 0,
      unique: fakeFiles.length,
    };
    return { files, counts };
  }
}
