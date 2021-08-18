import PropTypes from "prop-types";
import RepoType from "./RepoType";

/**
 * @typedef {{
 *   id: string|number,
 *   name: string,
 *   repository: RepoEntity|undefined,
 * }} ContributorEntity
 */

/**
 * External file contributor (partner descriptor).
 */
export const ContributorType = PropTypes.shape({
  id: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  repository: RepoType,
});

export default ContributorType;
