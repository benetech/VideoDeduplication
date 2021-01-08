import React from "react";
import PropTypes from "prop-types";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import { routes } from "../../../routing/routes";
import { useIntl } from "react-intl";
import {
  SelectableTab,
  SelectableTabs,
} from "../../../common/components/SelectableTabs";

import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";

const useStyles = makeStyles(() => ({
  tabs: {
    maxWidth: 150,
  },
}));

/**
 * Identifiers for task page tabs.
 */
const Section = {
  details: "details",
  logs: "logs",
};

/**
 * Get current section
 */
function useSection() {
  const details = useRouteMatch({
    path: routes.processing.task,
    exact: true,
  });
  const logs = useRouteMatch({
    path: routes.processing.taskLogs,
    exact: true,
  });
  if (details) {
    return Section.details;
  } else if (logs) {
    return Section.logs;
  }
}

/**
 * Get i18n text
 */
function useMessages() {
  const intl = useIntl();
  return {
    details: intl.formatMessage({ id: "task.details" }),
    logs: intl.formatMessage({ id: "task.logs" }),
  };
}

/**
 * Get navigation handler
 */
function useNavigation(id) {
  const history = useHistory();
  return (newSection) => {
    if (newSection === Section.details) {
      history.replace(routes.processing.taskURL(id));
    } else if (newSection === Section.logs) {
      history.replace(routes.processing.taskLogsURL(id));
    }
  };
}

function TaskPageTabs(props) {
  const { className, ...other } = props;
  const { id } = useParams();
  const classes = useStyles();
  const section = useSection();
  const messages = useMessages();
  const navigate = useNavigation(id);

  return (
    <SelectableTabs
      className={clsx(classes.tabs, className)}
      value={section}
      onChange={navigate}
      {...other}
    >
      <SelectableTab
        label={messages.details}
        value={Section.details}
        size="large"
      />
      <SelectableTab label={messages.logs} value={Section.logs} size="large" />
    </SelectableTabs>
  );
}

TaskPageTabs.propTypes = {
  className: PropTypes.string,
};

export default TaskPageTabs;
