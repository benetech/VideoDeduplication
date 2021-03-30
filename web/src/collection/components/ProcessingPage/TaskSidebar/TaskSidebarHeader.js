import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import TextField from "@material-ui/core/TextField";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import {
  SelectableTab,
  SelectableTabs,
} from "../../../../common/components/SelectableTabs";
import { tabs } from "./tabs";

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(2),
    paddingTop: theme.spacing(3),
  },
  title: {
    flexShrink: 0,
    flexGrow: 20,
    fontWeight: "bold",
    ...theme.mixins.title2,
  },
  icon: {
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(1),
  },
  search: {
    flexShrink: 1,
  },
  titleContainer: {
    display: "flex",
    alignItems: "flex-end",
  },
  tabs: {
    width: "min-content",
    paddingTop: theme.spacing(4),
  },
  progress: {
    marginRight: theme.spacing(1),
  },
}));

/**
 * Get i18n text.
 */
function useMessages(count) {
  const intl = useIntl();
  const tasks = count === 1 ? "tasks.one" : "tasks.many";
  count = count != null ? count : "";
  return {
    title: `${count} ${intl.formatMessage({ id: tasks })}`,
    search: intl.formatMessage({ id: "actions.search" }),
    format(id) {
      return intl.formatMessage({ id });
    },
  };
}

function TaskSidebarHeader(props) {
  const { tab, onTabChange, count, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages(count);

  return (
    <div className={clsx(classes.header, className)} {...other}>
      <div className={classes.titleContainer}>
        <div className={classes.title}>{messages.title}</div>
        <SearchOutlinedIcon className={classes.icon} />
        <TextField
          label={messages.search}
          color="secondary"
          size="small"
          className={classes.search}
        />
      </div>
      <SelectableTabs
        value={tab}
        onChange={onTabChange}
        className={classes.tabs}
      >
        {tabs.map((tab) => (
          <SelectableTab
            key={tab.title}
            label={messages.format(tab.title)}
            value={tab}
          />
        ))}
      </SelectableTabs>
    </div>
  );
}

TaskSidebarHeader.propTypes = {
  /**
   * Active tab.
   */
  tab: PropTypes.oneOf(tabs),
  /**
   * Handle tab change.
   */
  onTabChange: PropTypes.func.isRequired,
  /**
   * Count of tasks.
   */
  count: PropTypes.number,
  className: PropTypes.string,
};

export default TaskSidebarHeader;
