import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import { useHistory, useRouteMatch } from "react-router-dom";
import { routes } from "../../../routing/routes";
import FileType from "../FileBrowserPage/FileType";
import SelectableTabs, {
  SelectableTab,
} from "../../../common/components/SelectableTabs";

/**
 * Identifiers for main file data sections
 */
const Section = {
  details: "details",
  matches: "matches",
  cluster: "cluster",
};

/**
 * Get current section
 */
function useSection() {
  const details = useRouteMatch({
    path: routes.collection.file,
    exact: true,
  });
  const matches = useRouteMatch({
    path: routes.collection.fileMatches,
    exact: true,
  });
  if (details) {
    return Section.details;
  } else if (matches) {
    return Section.matches;
  }
}

/**
 * Get i18n text
 */
function useMessages({ matches }) {
  const intl = useIntl();
  const filesMatched = matches === 1 ? "file.oneMatch" : "file.manyMatches";
  matches = String(matches).padStart(2, "0");
  return {
    details: intl.formatMessage({ id: "file.details" }),
    matches: intl.formatMessage({ id: filesMatched }, { count: matches }),
    cluster: intl.formatMessage({ id: "file.cluster" }),
  };
}

/**
 * Get navigation handler
 */
function useNavigation(file) {
  const history = useHistory();
  return (newSection) => {
    if (newSection === Section.details) {
      history.replace(routes.collection.fileURL(file.id));
    } else if (newSection === Section.matches) {
      history.replace(routes.collection.fileMatchesURL(file.id));
    }
  };
}

function FileNavigationTabs(props) {
  const { file, className } = props;
  const section = useSection();
  const messages = useMessages({ matches: file.matches.length });
  const navigate = useNavigation(file);

  return (
    <SelectableTabs
      className={clsx(className)}
      value={section}
      onChange={navigate}
    >
      <SelectableTab
        label={messages.details}
        value={Section.details}
        size="large"
      />
      <SelectableTab
        label={messages.matches}
        value={Section.matches}
        size="large"
      />
      <SelectableTab
        label={messages.cluster}
        value={Section.cluster}
        size="large"
      />
    </SelectableTabs>
  );
}

FileNavigationTabs.propTypes = {
  /**
   * Currently displayed file
   */
  file: FileType.isRequired,
  className: PropTypes.string,
};

export default FileNavigationTabs;
