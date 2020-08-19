import { randomPreview } from "./preview";

export function* randomScenes(count, videoLength = 120 * 1000) {
  for (let i = 0; i < count; i++) {
    yield {
      preview: randomPreview(),
      position: i * (videoLength / count),
    };
  }
}
