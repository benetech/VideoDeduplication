import { randomPreview } from "./preview";

function randomName() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    ".webm"
  );
}

function randomFile() {
  const name = randomName();
  return {
    id: name,
    filename: name,
    metadata: {
      grayAverage: Math.random() * 100,
      grayMax: Math.random() * 100,
      grayStd: Math.random() * 100,
      length: 101,
      stdAverage: Math.random() * 100,
      maxDiff: Math.random() * 100,
      flagged: Math.random() > 0.5,
      hasEXIF: Math.random() > 0.5,
    },
    preview: randomPreview(),
  };
}

function* randomFiles(count) {
  for (let i = 0; i < count; i++) {
    yield randomFile();
  }
}

export const fakeFiles = [...randomFiles(60)];
