/**
 * Create callback to seek to the given position in video file
 */
export function seekTo(player, file) {
  // always add 1 millisecond to workaround ReactPlayer's NPE bug
  return (object) =>
    player.seekTo((object.position + 1) / file.metadata.length);
}
