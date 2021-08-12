import PropTypes from "prop-types";
import { TemplateType } from "./TemplateType";

/**
 * Recognized object (synonym for Template Match) prop-type.
 *
 * @typedef {{
 *   id: string|number,
 *   fileId: string|number,
 *   templateId: string|number,
 *   start: number,
 *   end: number,
 *   meanDistance: number,
 *   minDistance: number,
 *   minDistanceTime: number,
 *   template: TemplateType|undefined|null,
 *   falsePositive: boolean|undefined,
 * }} ObjectType
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
  /**
   * Indicates whether the object is false-positive match.
   */
  falsePositive: PropTypes.bool,
});

export default ObjectType;
