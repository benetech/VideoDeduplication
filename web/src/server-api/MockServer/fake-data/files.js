import { randomPreview } from "./preview";
import { randomScenes } from "./scene";
import { randomObjects } from "./objects";
import { fakeExif } from "./exif";

export function randomMatch(source) {
  return {
    source,
    file: randomFile(),
    distance: Math.random(),
  };
}

export function* randomMatches(count, source) {
  for (let i = 0; i < count; i++) {
    yield randomMatch(source);
  }
}

export function randomName({ directory = "", extension = ".webm" } = {}) {
  return (
    directory +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    extension
  );
}

export function randomPlayback() {
  return "https://youtu.be/u04g-pHLPnM";
}

export function randomFile() {
  const name = randomName();
  const length = 1319000; // (60 + Math.random() * 250) * 1000; // 5 min at max
  return {
    id: name,
    filename: name,
    metadata: {
      grayAverage: Math.random() * 100,
      grayMax: Math.random() * 100,
      grayStd: Math.random() * 100,
      length: length,
      stdAverage: Math.random() * 100,
      maxDiff: Math.random() * 100,
      flagged: Math.random() > 0.5,
      hasEXIF: Math.random() > 0.5,
      fileType: "webm",
    },
    preview: randomPreview(),
    playbackURL: randomPlayback(),
    scenes: [...randomScenes(10 + Math.random() * 5, length)],
    objects: [...randomObjects(50, length)],
    exif: fakeExif,
  };
}

export function* randomFiles(count) {
  for (let i = 0; i < count; i++) {
    yield randomFile();
  }
}

export const fakeFiles = [...randomFiles(60)];
