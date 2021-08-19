import PropTypes from "prop-types";

/**
 * @typedef {{
 *   preview: string,
 *   position: number,
 * }} Scene
 */

/**
 * Property type for Scene in a video file.
 */
const SceneType = PropTypes.shape({
  /**
   * Preview URL
   */
  preview: PropTypes.string,
  /**
   * Scene start time position
   */
  position: PropTypes.number.isRequired,
});

export default SceneType;
