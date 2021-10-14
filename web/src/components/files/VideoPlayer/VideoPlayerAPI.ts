/**
 * Current player state.
 */
export type PlaybackStatus = {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
};

/**
 * Seek time units.
 */
export type TimeUnits = "fraction" | "seconds";

/**
 * Position in video file.
 */
export type PlaybackPosition = {
  position: number;
  units: TimeUnits;
};

/**
 * Optional arguments of the `VideoPlayerAPI.seekTo` method.
 */
export type SeekOptions = {
  playing?: boolean;
  units?: TimeUnits;
};

/**
 * Stepping forward/backward options.
 */
export type StepOptions = {
  amount?: number;
  playing?: boolean;
};

/**
 * Imperative API of the VideoPlayer component.
 */
export interface VideoPlayerAPI {
  /**
   * Seek to the given position and start playing.
   */
  seekTo(position: number, options?: SeekOptions): void;

  /**
   * Seek forward by the given `amount` of seconds.
   */
  stepForward(options?: StepOptions): void;

  /**
   * Seek back by the given `amount` of seconds.
   */
  stepBack(options?: StepOptions): void;

  /**
   * Get current time in seconds if available.
   */
  readonly currentTime: number | undefined;
}
