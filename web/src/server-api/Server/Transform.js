import { randomPreview } from "../MockServer/fake-data/preview";
import { randomPlayback } from "../MockServer/fake-data/files";
import { randomObjects } from "../MockServer/fake-data/objects";

/**
 * Data-transfer object and internal data format may evolve independently, the
 * Transform class decouples these two representations.
 */
export default class Transform {
  constructor() {}

  fetchFileResults(data) {
    const counts = {
      total: data.total,
      duplicates: 0,
      related: 0,
      unique: data.total,
    };

    const files = data.items.map((post) => this.videoFile(post));
    return { files, counts };
  }

  videoFile(data) {
    const length = data.meta.video_length * 1000;
    return {
      id: data.id,
      filename: data.file_path,
      metadata: {
        grayAverage: data.meta.gray_avg,
        fileType: data.exif && data.exif.General_FileExtension,
        hasAudio: data.exif && !!data.exif.Audio_Format,
        grayMax: data.meta.gray_max,
        grayStd: data.meta.gray_std,
        length: length,
        stdAverage: data.meta.video_avg_std,
        maxDiff: data.meta.video_max_dif,
        flagged: data.meta.flagged,
        hasEXIF: data.exif != null,
      },
      hash: data.sha256,
      fingerprint: data.signature && data.signature.signature,
      exif: data.exif,
      preview: randomPreview(),
      playbackURL: randomPlayback(),
      scenes: data.scenes && data.scenes.map((scene) => this.scene(scene)),
      objects: [...randomObjects(10, length)],
    };
  }

  scene(scene) {
    return {
      preview: randomPreview(),
      position: scene.start_time,
      duration: scene.duration,
    };
  }
}
