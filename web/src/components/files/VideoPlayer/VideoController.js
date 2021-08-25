/**
 * Seek time units.
 * @enum
 */
export const TimeUnits = {
  FRACTION: "fraction",
  SECONDS: "seconds",
};

/**
 * Imperative controller for VideoPlayer component.
 *
 * Unfortunately it is not possible to use pure declarative API with video
 * player.
 */
export default class VideoController {
  constructor(player, setWatch, setPlaying) {
    this._player = player;
    this._setWatch = setWatch; // show player
    this._setPlaying = setPlaying;
    this._position = null; // position requested by seekTo method
  }

  _trySeek() {
    // Player might be unavailable at the moment
    if (this._position != null && this._player != null) {
      try {
        // Rarely ReactPlayer's seekTo method
        // produces NPE, which should be handled
        const { position, units } = this._position;
        this._player.seekTo(position, units);
        this._position = null; // clear requested seek-to position on success
      } catch (error) {
        console.error(error);
      }
    }
  }

  _setPlayer(player) {
    this._player = player;
    this._trySeek(); // there might be postponed seek request
  }

  /**
   * Seek to the given position and start playing.
   * @param {number} position
   * @param {{
   *   playing: boolean,
   *   units: TimeUnits,
   * }} options
   */
  seekTo(position, options = {}) {
    const { playing = true, units = TimeUnits.FRACTION } = options;
    if (playing) {
      this._setWatch(true);
    }
    this._setPlaying(playing);
    this._position = { position, units };
    this._trySeek();
  }

  /**
   * Seek forward by the given `amount` of seconds.
   * @param {number} amount step in seconds
   * @param {boolean} playing play after seek
   */
  stepForward({ amount = 0.1, playing = false } = {}) {
    const position = this.currentTime + amount;
    this.seekTo(position, { playing, units: TimeUnits.SECONDS });
  }

  /**
   * Seek back by the given `amount` of seconds.
   * @param {number} amount step in seconds
   * @param {boolean} playing play after seek
   */
  stepBack({ amount = 0.1, playing = false } = {}) {
    const position = this.currentTime - amount;
    this.seekTo(position, { playing, units: TimeUnits.SECONDS });
  }

  /**
   * Get current time in seconds if available.
   * @return {number|null|undefined}
   */
  get currentTime() {
    return this._player?.getCurrentTime();
  }
}
