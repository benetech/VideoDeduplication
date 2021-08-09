import PropTypes from "prop-types";

const AttributeDescriptorType = PropTypes.shape({
  /**
   * React-Intl Id string.
   */
  title: PropTypes.string.isRequired,
  /**
   * Function mapping (value, intl) to a value cell content.
   */
  value: PropTypes.func.isRequired,
});

export default AttributeDescriptorType;
