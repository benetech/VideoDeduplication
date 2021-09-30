import { VideoPlayerAPI } from "../../components/files/VideoPlayer/VideoPlayerAPI";
import { Scene, VideoFile } from "../../model/VideoFile";
import { TemplateMatch } from "../../model/Template";
import objectPosition from "./objectPosition";

/**
 * Create callback to seek to the given position in video file
 */
export function seekToObject(
  player: VideoPlayerAPI | null,
  file?: VideoFile
): (object: TemplateMatch) => void {
  // Always add 1 millisecond to position to workaround ReactPlayer's NPE bug.
  // Always add 1 millisecond to file length to handle zero file length.
  return (object: TemplateMatch) =>
    player?.seekTo(
      (objectPosition(object) + 1) / ((file?.metadata?.length || 0) + 1)
    );
}

export function seekToScene(
  player: VideoPlayerAPI | null,
  file?: VideoFile
): (scene: Scene) => void {
  // Always add 1 millisecond to position to workaround ReactPlayer's NPE bug.
  // Always add 1 millisecond to file length to handle zero file length.
  return (scene: Scene) =>
    player?.seekTo((scene.position + 1) / ((file?.metadata?.length || 0) + 1));
}
