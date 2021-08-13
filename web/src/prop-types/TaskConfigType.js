import PropTypes from "prop-types";

/**
 * Prop-Type for common background task configuration.
 *
 * @typedef {{
 *   frameSampling: number|undefined,
 *   matchDistance: number|undefined,
 *   filterDark: boolean|undefined,
 *   darkThreshold: number|undefined,
 *   minDuration: number|undefined,
 *   extensions: string[]|undefined,
 * }} TaskConfig
 */
const TaskConfigType = PropTypes.shape({
  frameSampling: PropTypes.number,
  matchDistance: PropTypes.number,
  filterDark: PropTypes.bool,
  darkThreshold: PropTypes.number,
  minDuration: PropTypes.number,
  extensions: PropTypes.arrayOf(PropTypes.string.isRequired),
});

export default TaskConfigType;
