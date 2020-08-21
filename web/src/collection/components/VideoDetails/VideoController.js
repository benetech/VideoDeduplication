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

  _setPlayer(player) {
    this._player = player;
    // there might be postponed seek request
    if (this._position != null && this._player != null) {
      this._player.seekTo(this._position);
      this._position = null; // clear requested seek
    }
  }

  /**
   * Seek to the given position and start playing.
   */
  seekTo(position) {
    this._setWatch(true);
    this._position = position;

    // Player might be unavailable when seekTo is called
    if (this._position != null && this._player != null) {
      this._player.seekTo(this._position);
      this._position = null; // clear requested seek position
    }
  }
}
