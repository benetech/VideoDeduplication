import React, { useCallback } from "react";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import { EntityPageURLParams, routes } from "../../routing/routes";
import { useIntl } from "react-intl";
import {
  SelectableTab,
  SelectableTabs,
} from "../../components/basic/SelectableTabs";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import clsx from "clsx";
import { Task } from "../../model/Task";

const useStyles = makeStyles<Theme>(() => ({
  tabs: {
    width: "min-content",
  },
}));
/**
 * Identifiers for task page tabs.
 */

enum Section {
  details = "details",
  logs = "logs",
}
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
    details: intl.formatMessage({
      id: "task.details",
    }),
    logs: intl.formatMessage({
      id: "task.logs",
    }),
  };
}
/**
 * Get navigation handler
 */

function useNavigation(id: Task["id"]) {
  const history = useHistory();
  return useCallback((newSection: Section) => {
    switch (newSection) {
      case Section.details:
        history.replace(routes.processing.taskURL(id));
        return;
      case Section.logs:
        history.replace(routes.processing.taskLogsURL(id));
        return;
    }
  }, []);
}

function TaskPageTabs(props: TaskPageTabsProps): JSX.Element {
  const { className, ...other } = props;
  const { id } = useParams<EntityPageURLParams>();
  const classes = useStyles();
  const section = useSection();
  const messages = useMessages();
  const navigate = useNavigation(id);
  return (
    <SelectableTabs
      className={clsx(classes.tabs, className)}
      value={section}
      onChange={navigate}
      size="large"
      {...other}
    >
      <SelectableTab label={messages.details} value={Section.details} />
      <SelectableTab label={messages.logs} value={Section.logs} />
    </SelectableTabs>
  );
}

type TaskPageTabsProps = {
  className?: string;
};
export default TaskPageTabs;
