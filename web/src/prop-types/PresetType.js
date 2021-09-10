import PropTypes from "prop-types";

/**
 * @typedef {{
 *   id: number|string,
 *   name: string,
 *   filters: Object,
 * }} PresetEntity
 */

/**
 * Prop-type for a file filter preset.
 */
const PresetType = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string.isRequired,
  filters: PropTypes.object.isRequired,
});

export default PresetType;
