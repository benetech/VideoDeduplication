import { VideoFile } from "../../../../../model/VideoFile";

export type ProcessedFileDescr = {
  id: VideoFile["id"];
  path: VideoFile["filename"];
};
