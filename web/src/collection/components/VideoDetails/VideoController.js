/**
 * Imperative controller for VideoPlayer component.
 *
 * Unfortunately it is not possible to use pure declarative API with video
 * player.
 */
export default class VideoController {
  constructor(player, setWatch) {
    this._player = player;
    this._setWatch = setWatch; // show player
    this._position = null; // position requested by seekTo method
  }

  _trySeek() {
    // Player might be unavailable at the moment
    if (this._position != null && this._player != null) {
      try {
        // Rarely ReactPlayer's seekTo method
        // produces NPE, which should be handled
        this._player.seekTo(this._position);
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
   */
  seekTo(position) {
    this._setWatch(true);
    this._position = position;
    this._trySeek();
  }
}
