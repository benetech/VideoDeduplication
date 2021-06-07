import React, { useMemo, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import SelectableTabs, {
  SelectableTab,
} from "../../../../common/components/SelectableTabs";
import resolveRequestViews from "./resolveRequestViews";
import { useIntl } from "react-intl";
import TaskType from "../../../prop-types/TaskType";

const useStyles = makeStyles((theme) => ({
  tabs: {
    marginLeft: theme.spacing(2),
  },
  content: {
    marginTop: theme.spacing(4),
  },
}));

function TaskRequest(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  const views = useMemo(() => resolveRequestViews(task), [task]);
  const [currentView, setView] = useState(views[0]);
  const Component = currentView.component;

  return (
    <div className={clsx(className)} {...other}>
      <SelectableTabs
        value={currentView}
        onChange={setView}
        className={classes.tabs}
      >
        {views.map((view) => (
          <SelectableTab
            label={intl.formatMessage({ id: view.title })}
            value={view}
            key={view.title}
          />
        ))}
      </SelectableTabs>
      <div className={classes.content}>
        <Component task={task} />
      </div>
    </div>
  );
}

TaskRequest.propTypes = {
  /**
   * Task which request will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default TaskRequest;
