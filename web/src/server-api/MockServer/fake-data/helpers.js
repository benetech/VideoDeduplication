export function randomIndex(length) {
  return Math.ceil(Math.random() * length) - 1;
}

export function pickRandom(list) {
  return list[randomIndex(list.length)];
}
