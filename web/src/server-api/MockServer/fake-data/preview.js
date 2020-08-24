import { pickRandom } from "./helpers";

const previewStubs = [
  "https://images.unsplash.com/photo-1561839561-b13bcfe95249?crop=entropy&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1595781257970-13e3f0586fcf?crop=entropy&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1559004328-d65ee06c5947?crop=entropy&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1589991410175-1aab16300bf7?crop=entropy&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1549887534-1541e9326642?crop=faces&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?crop=faces&fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1548811579-017cf2a4268b?fit=crop&h=117&w=272&q=80",
  "https://images.unsplash.com/photo-1579947642314-54b5f8c806ab?crop=faces&fit=crop&h=117&w=272&q=80",
];

export function randomPreview() {
  return pickRandom(previewStubs);
}
