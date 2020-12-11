import React, { useState } from "react";
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
  tab: {
    marginRight: theme.spacing(4),
  },
}));

/**
 * Get i18n text.
 */
function useMessages(count) {
  const intl = useIntl();
  const tasks = count === 1 ? "tasks.one" : "tasks.many";
  return {
    title: `${count} ${intl.formatMessage({ id: tasks })}`,
    search: intl.formatMessage({ id: "actions.search" }),
  };
}

function TaskSidebarHeader(props) {
  const { count, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages(count);
  const [value, setValue] = useState(0);

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
        value={value}
        onChange={setValue}
        className={classes.tabs}
      >
        <SelectableTab label="Active" className={classes.tab} />
        <SelectableTab label="Finished" className={classes.tab} />
        <SelectableTab label="All" className={classes.tab} />
      </SelectableTabs>
    </div>
  );
}

TaskSidebarHeader.propTypes = {
  /**
   * Count of tasks.
   */
  count: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default TaskSidebarHeader;
