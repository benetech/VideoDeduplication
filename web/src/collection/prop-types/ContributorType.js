import PropTypes from "prop-types";
import RepoType from "./RepoType";

export const ContributorType = PropTypes.shape({
  id: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  repository: RepoType,
});

export default ContributorType;
