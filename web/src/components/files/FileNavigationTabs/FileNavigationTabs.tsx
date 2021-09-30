import React from "react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import { useHistory, useRouteMatch } from "react-router-dom";
import { routes } from "../../../routing/routes";
import SelectableTabs, { SelectableTab } from "../../basic/SelectableTabs";

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
  const cluster = useRouteMatch({
    path: routes.collection.fileCluster,
    exact: true,
  });

  if (details) {
    return Section.details;
  } else if (matches) {
    return Section.matches;
  } else if (cluster) {
    return Section.cluster;
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
    details: intl.formatMessage({
      id: "file.details",
    }),
    matches: intl.formatMessage(
      {
        id: filesMatched,
      },
      {
        count: matches,
      }
    ),
    cluster: intl.formatMessage({
      id: "file.cluster",
    }),
  };
}
/**
 * Get navigation handler
 */

function useNavigation(id) {
  const history = useHistory();
  return (newSection) => {
    if (newSection === Section.details) {
      history.replace(routes.collection.fileURL(id));
    } else if (newSection === Section.matches) {
      history.replace(routes.collection.fileMatchesURL(id));
    } else if (newSection === Section.cluster) {
      history.replace(routes.collection.fileClusterURL(id));
    }
  };
}

function FileNavigationTabs(props: FileNavigationTabsProps): JSX.Element {
  const { id, matches = 0, remote = false, className } = props;
  const section = useSection();
  const messages = useMessages({
    matches,
  });
  const navigate = useNavigation(id);
  return (
    <SelectableTabs
      className={clsx(className)}
      value={section}
      onChange={navigate}
      size="large"
    >
      <SelectableTab
        label={messages.details}
        value={Section.details}
        disabled={remote}
      />
      <SelectableTab label={messages.matches} value={Section.matches} />
      <SelectableTab label={messages.cluster} value={Section.cluster} />
    </SelectableTabs>
  );
}

type FileNavigationTabsProps = {
  /**
   * Currently displayed file id.
   */
  id: string | number;

  /**
   * Number of file matches.
   */
  matches?: number;

  /**
   * Flag indicating that the file is remote.
   */
  remote?: boolean;
  className?: string;
};
export default FileNavigationTabs;
