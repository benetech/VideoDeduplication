import { randomPreview } from "../MockServer/fake-data/preview";

export default class Transform {
  constructor() {}

  fetchFileResults(data) {
    const counts = {
      total: data.count,
      duplicates: 0,
      related: 0,
      unique: data.count,
    };

    const files = data.posts.map((post) => this.videoMetadata(post));
    return { files, counts };
  }

  videoMetadata(data) {
    return {
      id: data.original_filename,
      filename: data.original_filename,
      metadata: {
        grayAverage: data.gray_avg,
        fileType: data.file_type,
        codec: data.codec,
        hasAudio: data.has_audio,
        grayMax: data.gray_max,
        grayStd: data.gray_std,
        length: data.video_length,
        stdAverage: data.video_avg_std,
        maxDiff: data.video_max_dif,
        flagged: data.flagged,
        hasEXIF: data.exif != null,
      },
      hash: data.hash,
      fingerprint: data.fingerprint,
      exif: data.exif,
      preview: randomPreview(),
    };
  }
}
