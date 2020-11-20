/**
 * Create callback to seek to the given position in video file
 */
export function seekTo(player, file) {
  // Always add 1 millisecond to position to workaround ReactPlayer's NPE bug.
  // Always add 1 millisecond to file length to handle zero file length.
  return (object) =>
    player.seekTo((object.position + 1) / (file.metadata.length + 1));
}
