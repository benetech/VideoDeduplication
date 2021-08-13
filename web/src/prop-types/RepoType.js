import PropTypes from "prop-types";

/**
 * Prop-type for remote fingerprint repository.
 *
 * @typedef {{
 *   id: string|number,
 *   name: string,
 *   address: string,
 *   login: string,
 *   type: string,
 * }} RepoEntity
 */
export const RepoType = PropTypes.shape({
  id: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  login: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
});

export default RepoType;
