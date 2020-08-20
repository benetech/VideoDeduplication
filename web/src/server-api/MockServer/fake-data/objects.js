import { pickRandom } from "./helpers";

const kinds = ["car", "airplane", "music"];

export function* randomObjects(count, fullLength) {
  for (let i = 0; i < count; i++) {
    yield {
      position: Math.random() * fullLength,
      kind: pickRandom(kinds),
    };
  }
}
