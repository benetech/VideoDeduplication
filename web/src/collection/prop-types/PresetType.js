import PropTypes from "prop-types";

/**
 * Prop-type for a file filter preset.
 */
const PresetType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  filters: PropTypes.object.isRequired,
});

export default PresetType;
