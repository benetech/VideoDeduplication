import { randomPreview } from "./preview";
import { randomScenes } from "./scene";
import { randomObjects } from "./objects";
import { fakeExif } from "./exif";

function randomName() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    ".webm"
  );
}

export function randomPlayback() {
  return "https://youtu.be/u04g-pHLPnM";
}

export function randomFile() {
  const name = randomName();
  const length = (60 + Math.random() * 250) * 1000; // 5 min at max
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
    },
    preview: randomPreview(),
    playbackURL: randomPlayback(),
    scenes: [...randomScenes(10 + Math.random() * 5, length)],
    objects: [...randomObjects(20, length)],
    exif: fakeExif,
  };
}

function* randomFiles(count) {
  for (let i = 0; i < count; i++) {
    yield randomFile();
  }
}

export const fakeFiles = [...randomFiles(60)];
