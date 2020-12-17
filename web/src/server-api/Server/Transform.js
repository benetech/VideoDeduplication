import { randomObjects } from "../MockServer/fake-data/objects";

/**
 * Data-transfer object and internal data format may evolve independently, the
 * Transform class decouples these two representations.
 */
export default class Transform {
  constructor() {}

  fetchFileResults(data) {
    const counts = {
      all: data.total,
      duplicates: data.duplicates,
      related: data.related,
      unique: data.unique,
    };

    const files = data.items.map((post) => this.videoFile(post));
    return { files, counts };
  }

  videoFile(data) {
    const meta = this.fileMetadata(data);
    return {
      id: data.id,
      filename: data.file_path,
      metadata: {
        fileType: this.fileType(data),
        hasAudio: data.exif && !!data.exif.Audio_Format,
        hasEXIF: data.exif != null,
        created: this.fileCreatedDate(data),
        ...meta,
      },
      hash: data.sha256,
      fingerprint: data.signature,
      exif: data.exif,
      preview: `/api/v1/files/${data.id}/thumbnail?time=0`,
      playbackURL: `/api/v1/files/${data.id}/watch`,
      scenes: this.fileScenes(data),
      objects: [...randomObjects(10, meta.length)],
      matchesCount: data.matches_count,
    };
  }

  fileCreatedDate(data) {
    const value = data?.exif?.General_Encoded_Date;
    if (value == null) {
      return null;
    }
    return new Date(value * 1000);
  }

  fileMetadata(data) {
    if (!data.meta) {
      return {
        length: data.exif?.General_Duration || 0,
      };
    }
    return {
      grayMax: data.meta.gray_max,
      flagged: data.meta.flagged,
      length: data.exif?.General_Duration || 0,
    };
  }

  fileType(file) {
    if (file.exif && file.exif.General_FileExtension) {
      return file.exif.General_FileExtension;
    }
    const match = file.file_path.match(/\.([^/.]+)$/);
    if (match && match[1]) {
      return match[1];
    } else {
      return undefined;
    }
  }

  scene(scene, file) {
    return {
      preview: `/api/v1/files/${file.id}/thumbnail?time=${scene.start_time}`,
      position: scene.start_time * 1000,
      duration: scene.duration * 1000,
    };
  }

  fileScenes(file) {
    const scenes =
      file.scenes && file.scenes.map((scene) => this.scene(scene, file));
    if (!scenes || scenes.length === 0) {
      return [
        {
          preview: `/api/v1/files/${file.id}/thumbnail?time=0`,
          position: 0,
          duration: (file.meta && file.meta.video_length * 1000) || 0,
        },
      ];
    }
    return scenes;
  }

  fetchFileClusterResults(data) {
    return {
      total: data.total,
      matches: data.matches.map((match) => this.fileClusterMatch(match)),
      files: data.files.map((file) => this.videoFile(file)),
    };
  }

  fileClusterMatch(match) {
    return { ...match }; // No difference at the moment
  }

  fetchFileMatchesResults(data) {
    return {
      offset: data.offset,
      total: data.total,
      matches: data.items.map((match) => this.fileMatch(match)),
    };
  }

  fileMatch(match) {
    return {
      id: match.id,
      distance: match.distance,
      file: this.videoFile(match.file),
    };
  }

  fetchTasksResults(data) {
    return {
      offset: data.offset,
      total: data.total,
      tasks: data.items.map((task) => this.task(task)),
    };
  }

  task(data) {
    // Nothing to change yet...
    return data;
  }
}
