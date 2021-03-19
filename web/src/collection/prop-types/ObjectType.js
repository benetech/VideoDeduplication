import PropTypes from "prop-types";
import { TemplateType } from "./TemplateType";

/**
 * Property type for object recognized in a video file.
 */
const ObjectType = PropTypes.shape({
  /**
   * Template match id.
   */
  id: PropTypes.any.isRequired,
  /**
   * Matched file id.
   */
  fileId: PropTypes.number.isRequired,
  /**
   * Matched template id.
   */
  templateId: PropTypes.number.isRequired,
  /**
   * Start time, ms.
   */
  start: PropTypes.number.isRequired,
  /**
   * End time, ms.
   */
  end: PropTypes.number.isRequired,
  /**
   * Mean distance between template and the video fragment.
   */
  meanDistance: PropTypes.number.isRequired,
  /**
   * Minimum distance between template and the video fragment.
   */
  minDistance: PropTypes.number.isRequired,
  /**
   * Maximal similarity time, ms.
   */
  minDistanceTime: PropTypes.number.isRequired,
  /**
   * Template data.
   */
  template: TemplateType,
});

export default ObjectType;
