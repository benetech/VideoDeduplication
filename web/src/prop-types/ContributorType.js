import PropTypes from "prop-types";
import RepoType from "./RepoType";

/**
 * External file contributor (partner descriptor).
 *
 * @typedef {{
 *   id: string|number,
 *   name: string,
 *   repository: RepoType|undefined,
 * }} ContributorType
 */
export const ContributorType = PropTypes.shape({
  id: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  repository: RepoType,
});

export default ContributorType;
