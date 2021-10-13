import ReactPlayer from "react-player";
import { Setter } from "../../../lib/types/Setter";
import {
  PlaybackPosition,
  SeekOptions,
  StepOptions,
  VideoPlayerAPI,
} from "./VideoPlayerAPI";

/**
 * Imperative controller for VideoPlayer component.
 *
 * Unfortunately it is not possible to use pure declarative API with video
 * player.
 */
export default class VideoController implements VideoPlayerAPI {
  private player: ReactPlayer | null;
  private readonly setWatch: Setter<boolean>;
  private readonly setPlaying: Setter<boolean>;

  // Seek-to position that was requested but wasn't fulfilled yet.
  private position: PlaybackPosition | null;

  constructor(
    player: ReactPlayer | null,
    setWatch: Setter<boolean>,
    setPlaying: Setter<boolean>
  ) {
    this.player = player;
    this.setWatch = setWatch; // show player
    this.setPlaying = setPlaying;
    this.position = null; // position requested by seekTo method
  }

  private trySeek(): void {
    // Player might be unavailable at the moment
    if (this.position != null && this.player != null) {
      try {
        // Rarely ReactPlayer's seekTo method
        // produces NPE, which should be handled
        const { position, units } = this.position;
        this.player.seekTo(position, units);
        this.position = null; // clear requested seek-to position on success
      } catch (error) {
        console.error(error);
      }
    }
  }

  setPlayer(player: ReactPlayer | null): void {
    this.player = player;
    this.trySeek(); // there might be postponed seek request
  }

  /**
   * Seek to the given position and start playing.
   */
  seekTo(position: number, options: SeekOptions = {}): void {
    const { playing = true, units = "fraction" } = options;
    if (playing) {
      this.setWatch(true);
    }
    this.setPlaying(playing);
    this.position = { position, units };
    this.trySeek();
  }

  /**
   * Seek forward by the given `amount` of seconds.
   */
  stepForward(options: StepOptions = {}): void {
    const { amount = 0.1, playing = false } = options;
    const position = (this.currentTime || 0) + amount;
    this.seekTo(position, { playing, units: "seconds" });
  }

  /**
   * Seek back by the given `amount` of seconds.
   */
  stepBack(options: StepOptions = {}): void {
    const { amount = 0.1, playing = false } = options;
    const position = Math.max((this.currentTime || 0) - amount, 0);
    this.seekTo(position, { playing, units: "seconds" });
  }

  /**
   * Get current time in seconds if available.
   */
  get currentTime(): number | undefined {
    return this.player?.getCurrentTime();
  }
}
