import PropTypes from "prop-types";

export const RepoType = PropTypes.shape({
  id: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  login: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
});

export default RepoType;
