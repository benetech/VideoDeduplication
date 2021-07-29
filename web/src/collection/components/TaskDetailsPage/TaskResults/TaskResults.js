import React, { useMemo, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TaskType from "../../../../prop-types/TaskType";
import { useIntl } from "react-intl";
import resolveResultViews from "./resolveResultViews";
import SelectableTabs, {
  SelectableTab,
} from "../../../../common/components/SelectableTabs";

const useStyles = makeStyles((theme) => ({
  tabs: {
    marginLeft: theme.spacing(2),
  },
  content: {
    marginTop: theme.spacing(4),
  },
}));

function TaskResults(props) {
  const { task, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  const views = useMemo(() => resolveResultViews(task), [task]);
  const [currentView, setView] = useState(views[0]);
  const Component = currentView.component;

  if (task.result == null) {
    return null;
  }

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

TaskResults.propTypes = {
  /**
   * Task which results will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default TaskResults;
