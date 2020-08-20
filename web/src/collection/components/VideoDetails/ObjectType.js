import PropTypes from "prop-types";

/**
 * Property type for object recognized in a video file.
 */
const ObjectType = PropTypes.shape({
  /**
   * Time in video at which object is recognized
   */
  position: PropTypes.number.isRequired,
  /**
   * Object kind: knife, explosion, etc.
   */
  kind: PropTypes.string.isRequired,
});

export default ObjectType;
